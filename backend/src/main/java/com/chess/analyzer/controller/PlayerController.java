package com.chess.analyzer.controller;

import com.chess.analyzer.model.GameSummary;
import com.chess.analyzer.model.PlayerProfile;
import com.chess.analyzer.service.ChessComService;
import com.chess.analyzer.service.PlayerSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final ChessComService chessComService;
    private final PlayerSearchService playerSearchService;

    @GetMapping("/suggest")
    public ResponseEntity<List<PlayerSearchService.PlayerSuggestion>> suggestPlayers(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(playerSearchService.searchSuggestions(q, limit));
    }

    @GetMapping("/{username}")
    public ResponseEntity<PlayerProfile> getPlayer(@PathVariable String username) {
        PlayerProfile profile = chessComService.getPlayerProfile(username);
        if (profile != null) {
            playerSearchService.registerUser(profile.getUsername(), profile.getName(), profile.getTitle(), profile.getAvatar());
        }
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{username}/games")
    public ResponseEntity<List<GameSummary>> getRecentGames(
            @PathVariable String username,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(chessComService.getRecentGames(username, limit));
    }
}
