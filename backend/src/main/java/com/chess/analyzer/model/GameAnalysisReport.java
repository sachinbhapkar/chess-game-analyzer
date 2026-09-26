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

    // Comprehensive Move Breakdown (Chess.com full style)
    private int whiteBrilliantMoves;
    private int blackBrilliantMoves;
    private int whiteGreatMoves;
    private int blackGreatMoves;
    private int whiteBestMoves;
    private int blackBestMoves;
    private int whiteExcellentMoves;
    private int blackExcellentMoves;
    private int whiteGoodMoves;
    private int blackGoodMoves;
    private int whiteBookMoves;
    private int blackBookMoves;
    private int whiteForcedMoves;
    private int blackForcedMoves;
    private int whiteInaccuracies;
    private int blackInaccuracies;
    private int whiteMistakes;
    private int blackMistakes;
    private int whiteMissedWins;
    private int blackMissedWins;
    private int whiteBlunders;
    private int blackBlunders;

    // ACPL
    private double whiteAcpl;
    private double blackAcpl;

    // Move-by-move evaluations
    private List<MoveEvaluation> moves;
}
