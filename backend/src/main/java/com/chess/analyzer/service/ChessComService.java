package com.chess.analyzer.service;

import com.chess.analyzer.model.GameSummary;
import com.chess.analyzer.model.PlayerProfile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChessComService {

    @Value("${chesscom.api.base-url:https://api.chess.com/pub}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        // Chess.com API requires a descriptive User-Agent
        headers.set("User-Agent", "ChessAnalyzer/1.0 (Java Spring Boot)");
        headers.set("Accept", "application/json");
        return headers;
    }

    public PlayerProfile getPlayerProfile(String username) {
        String url = baseUrl + "/player/" + username.toLowerCase().trim();
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<PlayerProfile> response = restTemplate.exchange(url, HttpMethod.GET, entity, PlayerProfile.class);
            PlayerProfile profile = response.getBody();

            // Also fetch stats
            if (profile != null) {
                try {
                    String statsUrl = baseUrl + "/player/" + username.toLowerCase().trim() + "/stats";
                    ResponseEntity<String> statsResponse = restTemplate.exchange(statsUrl, HttpMethod.GET, entity, String.class);
                    if (statsResponse.getStatusCode().is2xxSuccessful() && statsResponse.getBody() != null) {
                        Map<String, Object> statsMap = objectMapper.readValue(statsResponse.getBody(), Map.class);
                        profile.setStats(statsMap);
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch stats for player {}: {}", username, e.getMessage());
                }
            }
            return profile;
        } catch (Exception e) {
            log.error("Failed to fetch player profile for {}: {}", username, e.getMessage());
            throw new RuntimeException("Could not find Chess.com player: " + username);
        }
    }

    public List<GameSummary> getRecentGames(String username, int limit) {
        String cleanUsername = username.toLowerCase().trim();
        String archivesUrl = baseUrl + "/player/" + cleanUsername + "/games/archives";
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<String> archiveResponse = restTemplate.exchange(archivesUrl, HttpMethod.GET, entity, String.class);

            JsonNode root = objectMapper.readTree(archiveResponse.getBody());
            JsonNode archivesNode = root.get("archives");

            if (archivesNode == null || !archivesNode.isArray() || archivesNode.isEmpty()) {
                return Collections.emptyList();
            }

            List<String> archiveUrls = new ArrayList<>();
            for (JsonNode node : archivesNode) {
                archiveUrls.add(node.asText());
            }

            // Start from the most recent archive month backwards
            List<GameSummary> allGames = new ArrayList<>();
            for (int i = archiveUrls.size() - 1; i >= 0 && allGames.size() < limit; i--) {
                String monthUrl = archiveUrls.get(i);
                ResponseEntity<String> monthResponse = restTemplate.exchange(monthUrl, HttpMethod.GET, entity, String.class);
                JsonNode monthRoot = objectMapper.readTree(monthResponse.getBody());
                JsonNode gamesArray = monthRoot.get("games");

                if (gamesArray != null && gamesArray.isArray()) {
                    List<GameSummary> monthGames = new ArrayList<>();
                    for (JsonNode g : gamesArray) {
                        GameSummary summary = parseGameSummary(g);
                        monthGames.add(summary);
                    }
                    // Reverse month games so latest comes first
                    Collections.reverse(monthGames);
                    allGames.addAll(monthGames);
                }
            }

            if (allGames.size() > limit) {
                return allGames.subList(0, limit);
            }
            return allGames;
        } catch (Exception e) {
            log.error("Failed to fetch recent games for {}: {}", username, e.getMessage());
            throw new RuntimeException("Error fetching games for " + username + ": " + e.getMessage());
        }
    }

    private GameSummary parseGameSummary(JsonNode g) {
        GameSummary summary = new GameSummary();
        summary.setUrl(g.path("url").asText(""));
        summary.setPgn(g.path("pgn").asText(""));
        summary.setTimeControl(g.path("time_control").asText(""));
        summary.setTimeClass(g.path("time_class").asText(""));
        summary.setRated(g.path("rated").asBoolean(true));
        summary.setEndTime(g.path("end_time").asLong(0));

        // Generate an ID from URL (e.g. https://www.chess.com/game/live/123456789 -> 123456789)
        String url = summary.getUrl();
        if (url != null && !url.isEmpty()) {
            int lastSlash = url.lastIndexOf('/');
            summary.setId(lastSlash >= 0 ? url.substring(lastSlash + 1) : url);
        }

        JsonNode whiteNode = g.path("white");
        summary.setWhiteUsername(whiteNode.path("username").asText(""));
        summary.setWhiteRating(whiteNode.path("rating").asInt());
        summary.setWhiteResult(whiteNode.path("result").asText(""));

        JsonNode blackNode = g.path("black");
        summary.setBlackUsername(blackNode.path("username").asText(""));
        summary.setBlackRating(blackNode.path("rating").asInt());
        summary.setBlackResult(blackNode.path("result").asText(""));

        // Extract ECO and opening if available in PGN headers
        String pgn = summary.getPgn();
        if (pgn != null && !pgn.isEmpty()) {
            summary.setEco(extractPgnHeader(pgn, "ECO"));
            String ecoUrl = extractPgnHeader(pgn, "ECOUrl");
            if (ecoUrl != null && !ecoUrl.isEmpty()) {
                String openingName = ecoUrl.substring(ecoUrl.lastIndexOf('/') + 1).replace('-', ' ');
                summary.setOpening(openingName);
            }
        }

        return summary;
    }

    public static String extractPgnHeader(String pgn, String headerName) {
        if (pgn == null) return null;
        String prefix = "[" + headerName + " \"";
        int start = pgn.indexOf(prefix);
        if (start != -1) {
            int valStart = start + prefix.length();
            int end = pgn.indexOf("\"", valStart);
            if (end != -1) {
                return pgn.substring(valStart, end);
            }
        }
        return null;
    }
}
