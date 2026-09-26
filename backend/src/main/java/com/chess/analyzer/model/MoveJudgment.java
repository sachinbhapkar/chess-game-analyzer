package com.chess.analyzer.model;

import lombok.Getter;

@Getter
public enum MoveJudgment {
    BEST("Best", "#10b981", "★"),
    EXCELLENT("Excellent", "#3b82f6", "✓"),
    GOOD("Good", "#8b5cf6", "○"),
    INACCURACY("Inaccuracy", "#f59e0b", "?!"),
    MISTAKE("Mistake", "#f97316", "?"),
    BLUNDER("Blunder", "#ef4444", "??"),
    BOOK("Book", "#6366f1", "📖");

    private final String label;
    private final String color;
    private final String symbol;

    MoveJudgment(String label, String color, String symbol) {
        this.label = label;
        this.color = color;
        this.symbol = symbol;
    }
}
