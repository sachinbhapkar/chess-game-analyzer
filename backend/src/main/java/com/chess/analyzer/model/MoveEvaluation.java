package com.chess.analyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveEvaluation {
    private int ply;
    private int moveNumber;
    private String playerColor; // "white" or "black"
    private String san;
    private String uci;
    private String fenBefore;
    private String fenAfter;

    // Evaluation after the move
    private Double evalScore; // Score in pawns from White's perspective (+0.50, -1.20)
    private Integer mateIn;   // Number of moves to mate (+3 for White win, -2 for Black win)
    private String evalText;  // Formatted string "+0.45", "-2.10", "M2", "-M1"

    // Engine recommendation
    private String bestMoveUci;
    private String bestMoveSan;
    private Double bestEvalScore;
    private Integer bestMateIn;

    // Analysis verdict
    private MoveJudgment judgment;
    private double centipawnLoss;
    private double winChanceBefore;
    private double winChanceAfter;
    private double winChanceLoss;
    private String explanation;
}
