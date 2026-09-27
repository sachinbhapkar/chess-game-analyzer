package com.chess.analyzer.controller;

import com.chess.analyzer.model.EngineInfo;
import com.chess.analyzer.service.EngineRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/engines")
@RequiredArgsConstructor
public class EngineController {

    private final EngineRegistryService engineRegistryService;

    @GetMapping
    public ResponseEntity<List<EngineInfo>> getAllEngines() {
        return ResponseEntity.ok(engineRegistryService.getAllEngines());
    }

    @GetMapping("/available")
    public ResponseEntity<List<EngineInfo>> getAvailableEngines() {
        return ResponseEntity.ok(engineRegistryService.getAvailableEngines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EngineInfo> getEngineById(@PathVariable String id) {
        return ResponseEntity.ok(engineRegistryService.getEngine(id));
    }

    @PostMapping("/refresh")
    public ResponseEntity<List<EngineInfo>> refreshEngines() {
        engineRegistryService.refreshEngines();
        return ResponseEntity.ok(engineRegistryService.getAllEngines());
    }
}
