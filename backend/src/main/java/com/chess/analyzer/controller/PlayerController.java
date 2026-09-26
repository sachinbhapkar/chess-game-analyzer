package com.chess.analyzer.controller;

import com.chess.analyzer.model.GameSummary;
import com.chess.analyzer.model.PlayerProfile;
import com.chess.analyzer.service.ChessComService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final ChessComService chessComService;

    @GetMapping("/{username}")
    public ResponseEntity<PlayerProfile> getPlayer(@PathVariable String username) {
        return ResponseEntity.ok(chessComService.getPlayerProfile(username));
    }

    @GetMapping("/{username}/games")
    public ResponseEntity<List<GameSummary>> getRecentGames(
            @PathVariable String username,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(chessComService.getRecentGames(username, limit));
    }
}
