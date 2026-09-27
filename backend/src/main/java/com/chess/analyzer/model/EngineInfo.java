package com.chess.analyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngineInfo {
    private String id;
    private String name;
    private String version;
    private String tagline;
    private String description;
    private String author;
    private String type; // "NNUE", "Deep Neural Network (MCTS)", "Classical"
    private String rating; // e.g. "3550+ ELO"
    private boolean isAvailable;
    private String binaryPath;
    private String installCommand; // e.g. "brew install lc0"
    private String projectUrl; // e.g. "https://stockfishchess.org"
    private int defaultDepth;
    private int defaultMovetimeMs;
    private boolean isDefault;
}
