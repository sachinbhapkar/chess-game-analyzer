package com.chess.analyzer;

import com.chess.analyzer.model.GameAnalysisReport;
import com.chess.analyzer.model.MoveEvaluation;
import com.chess.analyzer.service.GameAnalyzerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class GameAnalyzerServiceTest {

    @Autowired
    private GameAnalyzerService gameAnalyzerService;

    @Test
    void testScholarsMateAnalysis() {
        String pgn = """
                [Event "Test Game"]
                [Site "Chess.com"]
                [White "Tester1"]
                [Black "Tester2"]
                [Result "1-0"]

                1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0
                """;

        GameAnalysisReport report = gameAnalyzerService.analyzePgn(pgn, 8, 100);

        assertNotNull(report);
        assertEquals("Tester1", report.getWhitePlayer());
        assertEquals("Tester2", report.getBlackPlayer());
        assertEquals("1-0", report.getResult());
        assertFalse(report.getMoves().isEmpty());
        assertEquals(7, report.getMoves().size());

        MoveEvaluation lastMove = report.getMoves().get(6);
        assertEquals("Qxf7#", lastMove.getSan());
        assertTrue(report.getBlackBlunders() > 0 || report.getBlackMistakes() > 0);
    }
}
