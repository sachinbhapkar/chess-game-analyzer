package com.chess.analyzer.controller;

import com.chess.analyzer.model.AnalysisRequest;
import com.chess.analyzer.model.GameAnalysisReport;
import com.chess.analyzer.service.GameAnalyzerService;
import com.chess.analyzer.service.StockfishService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final GameAnalyzerService gameAnalyzerService;
    private final StockfishService stockfishService;

    @PostMapping("/pgn")
    public ResponseEntity<GameAnalysisReport> analyzePgn(@RequestBody AnalysisRequest request) {
        if (request.getPgn() == null || request.getPgn().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        GameAnalysisReport report = gameAnalyzerService.analyzePgn(
                request.getPgn(),
                request.getDepth(),
                request.getMovetimeMs(),
                request.getEngineId()
        );
        return ResponseEntity.ok(report);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        String binary = stockfishService.resolveStockfishBinary();
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "stockfishBinary", binary,
                "defaultDepth", stockfishService.getDefaultDepth(),
                "defaultMovetimeMs", stockfishService.getDefaultMovetimeMs()
        ));
    }
}
