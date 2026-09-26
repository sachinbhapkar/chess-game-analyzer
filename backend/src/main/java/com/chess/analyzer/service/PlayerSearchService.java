package com.chess.analyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PlayerSearchService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerSuggestion {
        private String username;
        private String name;
        private String title;
        private String avatar;
        private Integer rating;
    }

    private final Map<String, PlayerSuggestion> playerDirectory = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void initDirectory() {
        // Seed curated world-class grandmasters, champions, and popular creators
        addSeed("magnuscarlsen", "Magnus Carlsen", "GM", "https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.200x200o.361c2f8a59c2.jpg", 3394);
        addSeed("hikaru", "Hikaru Nakamura", "GM", "https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png", 3443);
        addSeed("danielnaroditsky", "Daniel Naroditsky", "GM", null, 3150);
        addSeed("nihalsarin", "Nihal Sarin", "GM", "https://images.chesscomfiles.com/uploads/v1/user/7195919.159050ca.200x200o.883e75faf64e.jpg", 3319);
        addSeed("gukeshd", "Gukesh D", "GM", null, 3050);
        addSeed("rpragchess", "Praggnanandhaa R", "GM", null, 3080);
        addSeed("arjun_erigaisi", "Arjun Erigaisi", "GM", null, 3120);
        addSeed("fabianocaruana", "Fabiano Caruana", "GM", null, 3200);
        addSeed("alireza2003", "Alireza Firouzja", "GM", null, 3350);
        addSeed("dingliren", "Ding Liren", "GM", null, 3090);
        addSeed("lachesisq", "Ian Nepomniachtchi", "GM", null, 3210);
        addSeed("anishgiri", "Anish Giri", "GM", null, 3100);
        addSeed("wesley_so", "Wesley So", "GM", null, 3250);
        addSeed("levonaronian", "Levon Aronian", "GM", null, 3140);
        addSeed("mvl", "Maxime Vachier-Lagrave", "GM", null, 3200);
        addSeed("viditchess", "Vidit Gujrathi", "GM", null, 3010);
        addSeed("hansontwitch", "Hans Niemann", "GM", null, 3180);
        addSeed("nodirbek", "Nodirbek Abdusattorov", "GM", null, 3160);
        addSeed("vincentkeymer", "Vincent Keymer", "GM", null, 2990);
        addSeed("polish_fighter3000", "Jan-Krzysztof Duda", "GM", null, 3314);
        addSeed("gurelediz", "Ediz Gürel", "GM", null, 3315);
        addSeed("penguingm1", "Andrew Tang", "GM", null, 3280);
        addSeed("chessbrah", "Eric Hansen", "GM", null, 2950);
        addSeed("imrosen", "Eric Rosen", "IM", null, 2550);
        addSeed("gothamchess", "Levy Rozman", "IM", null, 2400);
        addSeed("alexandrabotez", "Alexandra Botez", "WFM", null, 2050);
        addSeed("itsandreabotez", "Andrea Botez", "", null, 1850);
        addSeed("annacramling", "Anna Cramling", "WFM", null, 2100);
        addSeed("akanemsko", "Nemo Zhou", "WGM", null, 2300);

        // Fetch Chess.com leaderboard asynchronously to augment directory
        Thread.ofVirtual().start(this::loadChessComLeaderboard);
    }

    private void addSeed(String username, String name, String title, String avatar, Integer rating) {
        playerDirectory.put(username.toLowerCase(), PlayerSuggestion.builder()
                .username(username)
                .name(name)
                .title(title)
                .avatar(avatar)
                .rating(rating)
                .build());
    }

    private void loadChessComLeaderboard() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "ChessAnalyzer/1.0 (Leaderboard Indexer)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.chess.com/pub/leaderboards",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String[] categories = {"live_blitz", "live_rapid", "live_bullet"};
                for (String cat : categories) {
                    JsonNode list = root.get(cat);
                    if (list != null && list.isArray()) {
                        for (JsonNode playerNode : list) {
                            String username = playerNode.path("username").asText("");
                            if (!username.isEmpty()) {
                                String name = playerNode.path("name").asText("");
                                String title = playerNode.path("title").asText("");
                                String avatar = playerNode.path("avatar").asText("");
                                int score = playerNode.path("score").asInt(0);

                                playerDirectory.put(username.toLowerCase(), PlayerSuggestion.builder()
                                        .username(username)
                                        .name(name.isEmpty() ? null : name)
                                        .title(title.isEmpty() ? null : title)
                                        .avatar(avatar.isEmpty() ? null : avatar)
                                        .rating(score > 0 ? score : null)
                                        .build());
                            }
                        }
                    }
                }
                log.info("Loaded {} players into search autocomplete directory.", playerDirectory.size());
            }
        } catch (Exception e) {
            log.warn("Could not load dynamic leaderboard players: {}", e.getMessage());
        }
    }

    public List<PlayerSuggestion> searchSuggestions(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            // Return top seeded players
            return playerDirectory.values().stream()
                    .sorted((a, b) -> Integer.compare(b.getRating() != null ? b.getRating() : 0, a.getRating() != null ? a.getRating() : 0))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        String q = query.toLowerCase().trim();

        return playerDirectory.values().stream()
                .filter(p -> p.getUsername().toLowerCase().contains(q) || (p.getName() != null && p.getName().toLowerCase().contains(q)))
                .sorted((a, b) -> {
                    // Prefix matches first
                    boolean aStarts = a.getUsername().toLowerCase().startsWith(q);
                    boolean bStarts = b.getUsername().toLowerCase().startsWith(q);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    // Then by rating
                    int rateA = a.getRating() != null ? a.getRating() : 0;
                    int rateB = b.getRating() != null ? b.getRating() : 0;
                    return Integer.compare(rateB, rateA);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    public void registerUser(String username, String name, String title, String avatar) {
        if (username != null && !username.isEmpty()) {
            playerDirectory.put(username.toLowerCase(), PlayerSuggestion.builder()
                    .username(username)
                    .name(name)
                    .title(title)
                    .avatar(avatar)
                    .build());
        }
    }
}
