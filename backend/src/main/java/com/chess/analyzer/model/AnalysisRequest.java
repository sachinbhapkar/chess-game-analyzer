package com.chess.analyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {
    private String pgn;
    private String gameUrl;
    private Integer depth;
    private Integer movetimeMs;
    private String playerPerspective; // optional, e.g. username to focus on
    private String engineId; // optional, e.g. "stockfish", "lc0", "fairy-stockfish"
}
