package com.chess.analyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameAnalysisReport {
    private String gameId;
    private String url;
    private String pgn;
    private String opening;
    private String timeClass;
    private String result;

    private String whitePlayer;
    private Integer whiteRating;
    private String blackPlayer;
    private Integer blackRating;

    // Accuracy (0 - 100%)
    private double whiteAccuracy;
    private double blackAccuracy;

    // Move Breakdown
    private int whiteBlunders;
    private int blackBlunders;
    private int whiteMistakes;
    private int blackMistakes;
    private int whiteInaccuracies;
    private int blackInaccuracies;
    private int whiteGoodMoves;
    private int blackGoodMoves;
    private int whiteBestMoves;
    private int blackBestMoves;
    private int whiteBookMoves;
    private int blackBookMoves;

    // ACPL
    private double whiteAcpl;
    private double blackAcpl;

    // Move-by-move evaluations
    private List<MoveEvaluation> moves;
}
