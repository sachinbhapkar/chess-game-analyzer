package com.chess.analyzer.model;

import lombok.Getter;

@Getter
public enum MoveJudgment {
    BRILLIANT("Brilliant", "#26c2a3", "!!"),
    GREAT("Great Move", "#5c8bb0", "!"),
    BEST("Best", "#81b64c", "★"),
    EXCELLENT("Excellent", "#96bc4b", "✓"),
    GOOD("Good", "#a3b18a", "○"),
    BOOK("Book", "#a88865", "📖"),
    FORCED("Forced", "#8c949e", "□"),
    INACCURACY("Inaccuracy", "#f0c15c", "?!"),
    MISTAKE("Mistake", "#e58f2a", "?"),
    MISSED_WIN("Missed Win", "#db4373", "✕"),
    BLUNDER("Blunder", "#ca3431", "??");

    private final String label;
    private final String color;
    private final String symbol;

    MoveJudgment(String label, String color, String symbol) {
        this.label = label;
        this.color = color;
        this.symbol = symbol;
    }
}
