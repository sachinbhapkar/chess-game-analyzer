package com.chess.analyzer.service;

import com.chess.analyzer.model.GameAnalysisReport;
import com.chess.analyzer.model.MoveEvaluation;
import com.chess.analyzer.model.MoveJudgment;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameAnalyzerService {

    private final StockfishService stockfishService;

    private static final Pattern HEADER_PATTERN = Pattern.compile("^\\[.*?\\]\\s*", Pattern.MULTILINE);
    private static final Pattern COMMENT_PATTERN = Pattern.compile("\\{.*?\\}");
    private static final Pattern MOVE_NUMBER_PATTERN = Pattern.compile("\\d+\\.+(\\.\\.)?");
    private static final Pattern RESULT_PATTERN = Pattern.compile("(1-0|0-1|1/2-1/2|\\*)\\s*$");

    public GameAnalysisReport analyzePgn(String pgn, Integer requestedDepth, Integer requestedMovetime) {
        int depth = requestedDepth != null && requestedDepth > 0 ? requestedDepth : stockfishService.getDefaultDepth();
        int movetime = requestedMovetime != null && requestedMovetime > 0 ? requestedMovetime : stockfishService.getDefaultMovetimeMs();

        // Extract metadata from PGN headers
        String whitePlayer = ChessComService.extractPgnHeader(pgn, "White");
        String blackPlayer = ChessComService.extractPgnHeader(pgn, "Black");
        String whiteEloStr = ChessComService.extractPgnHeader(pgn, "WhiteElo");
        String blackEloStr = ChessComService.extractPgnHeader(pgn, "BlackElo");
        String result = ChessComService.extractPgnHeader(pgn, "Result");
        String eco = ChessComService.extractPgnHeader(pgn, "ECO");
        String ecoUrl = ChessComService.extractPgnHeader(pgn, "ECOUrl");
        String opening = ecoUrl != null ? ecoUrl.substring(ecoUrl.lastIndexOf('/') + 1).replace('-', ' ') : eco;

        Integer whiteRating = whiteEloStr != null && !whiteEloStr.isEmpty() ? Integer.parseInt(whiteEloStr) : null;
        Integer blackRating = blackEloStr != null && !blackEloStr.isEmpty() ? Integer.parseInt(blackEloStr) : null;

        // Clean PGN to extract pure SAN moves
        String cleanedMoves = cleanPgnMoves(pgn);
        log.info("Analyzing game: {} vs {} (Moves: {})", whitePlayer, blackPlayer, cleanedMoves);

        MoveList moveList = new MoveList();
        try {
            moveList.loadFromSan(cleanedMoves);
        } catch (Exception e) {
            log.error("Failed to parse SAN moves using chesslib: {}", cleanedMoves, e);
            throw new RuntimeException("Could not parse chess moves: " + e.getMessage());
        }

        List<MoveEvaluation> evaluations = new ArrayList<>();
        Board board = new Board();

        int whiteBlunders = 0, blackBlunders = 0;
        int whiteMistakes = 0, blackMistakes = 0;
        int whiteInaccuracies = 0, blackInaccuracies = 0;
        int whiteGoodMoves = 0, blackGoodMoves = 0;
        int whiteBestMoves = 0, blackBestMoves = 0;
        int whiteBookMoves = 0, blackBookMoves = 0;

        double whiteTotalLoss = 0.0;
        double blackTotalLoss = 0.0;
        int whiteMoveCount = 0;
        int blackMoveCount = 0;

        double whiteTotalCpl = 0.0;
        double blackTotalCpl = 0.0;

        try (StockfishService.StockfishSession session = stockfishService.createSession()) {
            // Initial position evaluation
            String currentFen = board.getFen();
            StockfishService.EvaluationResult lastEval = session.evaluateFen(currentFen, depth, movetime);

            int totalMoves = moveList.size();
            for (int i = 0; i < totalMoves; i++) {
                Move move = moveList.get(i);
                int ply = i + 1;
                int moveNumber = (i / 2) + 1;
                boolean isWhite = (board.getSideToMove() == Side.WHITE);
                String playerColor = isWhite ? "white" : "black";
                String fenBefore = board.getFen();

                // Convert move to SAN for display
                String san = moveList.toSanArray()[i];
                String uci = move.toString().toLowerCase();

                // What engine thought was best BEFORE this move
                String bestMoveUci = lastEval.getBestMoveUci();
                Double bestScoreBefore = lastEval.getScoreInPawns();
                Integer bestMateBefore = lastEval.getMateIn();

                // Apply move on board
                board.doMove(move);
                String fenAfter = board.getFen();

                // Evaluate position after move
                StockfishService.EvaluationResult evalAfter = session.evaluateFen(fenAfter, depth, movetime);
                Double scoreAfter = evalAfter.getScoreInPawns();
                Integer mateAfter = evalAfter.getMateIn();

                // Calculate win chances from moving player's perspective
                double winChanceBefore = calculateWinChance(bestScoreBefore, bestMateBefore, isWhite);
                double winChanceAfter = calculateWinChance(scoreAfter, mateAfter, isWhite);
                double winChanceLoss = Math.max(0.0, winChanceBefore - winChanceAfter);

                // Centipawn loss
                double cpl = calculateCentipawnLoss(bestScoreBefore, scoreAfter, isWhite);

                // Classify move
                boolean isExactBest = uci.equalsIgnoreCase(bestMoveUci);
                MoveJudgment judgment;
                if (i < 4) {
                    // Early opening moves
                    judgment = MoveJudgment.BOOK;
                } else if (isExactBest || winChanceLoss < 1.0) {
                    judgment = MoveJudgment.BEST;
                } else if (winChanceLoss < 4.0) {
                    judgment = MoveJudgment.EXCELLENT;
                } else if (winChanceLoss < 9.0) {
                    judgment = MoveJudgment.GOOD;
                } else if (winChanceLoss < 18.0) {
                    judgment = MoveJudgment.INACCURACY;
                } else if (winChanceLoss < 32.0) {
                    judgment = MoveJudgment.MISTAKE;
                } else {
                    judgment = MoveJudgment.BLUNDER;
                }

                // Update aggregate stats
                if (isWhite) {
                    whiteMoveCount++;
                    whiteTotalLoss += winChanceLoss;
                    whiteTotalCpl += cpl;
                    switch (judgment) {
                        case BOOK -> whiteBookMoves++;
                        case BEST -> whiteBestMoves++;
                        case EXCELLENT, GOOD -> whiteGoodMoves++;
                        case INACCURACY -> whiteInaccuracies++;
                        case MISTAKE -> whiteMistakes++;
                        case BLUNDER -> whiteBlunders++;
                    }
                } else {
                    blackMoveCount++;
                    blackTotalLoss += winChanceLoss;
                    blackTotalCpl += cpl;
                    switch (judgment) {
                        case BOOK -> blackBookMoves++;
                        case BEST -> blackBestMoves++;
                        case EXCELLENT, GOOD -> blackGoodMoves++;
                        case INACCURACY -> blackInaccuracies++;
                        case MISTAKE -> blackMistakes++;
                        case BLUNDER -> blackBlunders++;
                    }
                }

                MoveEvaluation eval = MoveEvaluation.builder()
                        .ply(ply)
                        .moveNumber(moveNumber)
                        .playerColor(playerColor)
                        .san(san)
                        .uci(uci)
                        .fenBefore(fenBefore)
                        .fenAfter(fenAfter)
                        .evalScore(scoreAfter)
                        .mateIn(mateAfter)
                        .evalText(evalAfter.getEvalText())
                        .bestMoveUci(bestMoveUci)
                        .bestEvalScore(bestScoreBefore)
                        .bestMateIn(bestMateBefore)
                        .judgment(judgment)
                        .centipawnLoss(Math.round(cpl * 10.0) / 10.0)
                        .winChanceBefore(Math.round(winChanceBefore * 10.0) / 10.0)
                        .winChanceAfter(Math.round(winChanceAfter * 10.0) / 10.0)
                        .winChanceLoss(Math.round(winChanceLoss * 10.0) / 10.0)
                        .explanation(buildExplanation(judgment, san, bestMoveUci, winChanceLoss))
                        .build();

                evaluations.add(eval);
                lastEval = evalAfter;
            }
        } catch (Exception e) {
            log.error("Stockfish analysis error", e);
            throw new RuntimeException("Engine analysis failed: " + e.getMessage());
        }

        // Calculate accuracy percentage
        double whiteAccuracy = calculateAccuracy(whiteTotalLoss, whiteMoveCount);
        double blackAccuracy = calculateAccuracy(blackTotalLoss, blackMoveCount);

        double whiteAcpl = whiteMoveCount > 0 ? (whiteTotalCpl / whiteMoveCount) : 0.0;
        double blackAcpl = blackMoveCount > 0 ? (blackTotalCpl / blackMoveCount) : 0.0;

        return GameAnalysisReport.builder()
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .whiteRating(whiteRating)
                .blackRating(blackRating)
                .opening(opening != null ? opening : "Unknown Opening")
                .result(result != null ? result : "*")
                .pgn(pgn)
                .whiteAccuracy(Math.round(whiteAccuracy * 10.0) / 10.0)
                .blackAccuracy(Math.round(blackAccuracy * 10.0) / 10.0)
                .whiteBlunders(whiteBlunders)
                .blackBlunders(blackBlunders)
                .whiteMistakes(whiteMistakes)
                .blackMistakes(blackMistakes)
                .whiteInaccuracies(whiteInaccuracies)
                .blackInaccuracies(blackInaccuracies)
                .whiteGoodMoves(whiteGoodMoves)
                .blackGoodMoves(blackGoodMoves)
                .whiteBestMoves(whiteBestMoves)
                .blackBestMoves(blackBestMoves)
                .whiteBookMoves(whiteBookMoves)
                .blackBookMoves(blackBookMoves)
                .whiteAcpl(Math.round(whiteAcpl * 10.0) / 10.0)
                .blackAcpl(Math.round(blackAcpl * 10.0) / 10.0)
                .moves(evaluations)
                .build();
    }

    private String cleanPgnMoves(String pgn) {
        // Strip headers
        String withoutHeaders = HEADER_PATTERN.matcher(pgn).replaceAll("");
        // Strip clock comments { ... }
        String withoutComments = COMMENT_PATTERN.matcher(withoutHeaders).replaceAll(" ");
        // Strip result at the end
        String withoutResult = RESULT_PATTERN.matcher(withoutComments.trim()).replaceAll(" ");
        // Normalize whitespace
        return withoutResult.replaceAll("\\s+", " ").trim();
    }

    private double calculateWinChance(Double pawns, Integer mateIn, boolean forWhite) {
        if (mateIn != null) {
            if (forWhite) {
                return mateIn > 0 ? 100.0 : 0.0;
            } else {
                return mateIn < 0 ? 100.0 : 0.0;
            }
        }
        if (pawns == null) {
            pawns = 0.0;
        }

        // Invert pawns if evaluating from Black perspective
        double playerPawns = forWhite ? pawns : -pawns;
        double centipawns = playerPawns * 100.0;

        // Sigmoidal winning chance formula used in modern chess engines
        return 50.0 + 50.0 * (2.0 / (1.0 + Math.exp(-0.00368208 * centipawns)) - 1.0);
    }

    private double calculateCentipawnLoss(Double before, Double after, boolean isWhite) {
        if (before == null || after == null) return 0.0;
        double pBefore = isWhite ? before : -before;
        double pAfter = isWhite ? after : -after;
        double loss = (pBefore - pAfter) * 100.0;
        return Math.max(0.0, loss);
    }

    private double calculateAccuracy(double totalLoss, int moveCount) {
        if (moveCount == 0) return 100.0;
        double avgLoss = totalLoss / moveCount;
        // Standard accuracy formula: maps avg win-chance loss to 0-100%
        double acc = 100.0 - (avgLoss * 2.2);
        return Math.max(10.0, Math.min(100.0, acc));
    }

    private String buildExplanation(MoveJudgment judgment, String san, String bestMoveUci, double loss) {
        return switch (judgment) {
            case BOOK -> "Standard opening book move";
            case BEST -> "Best move found by the engine";
            case EXCELLENT -> "Strong practical choice";
            case GOOD -> "Decent move, maintaining the position";
            case INACCURACY -> "Slight inaccuracy (-" + String.format("%.1f", loss) + "% win chance). Best was " + bestMoveUci;
            case MISTAKE -> "Mistake (-" + String.format("%.1f", loss) + "% win chance). Better was " + bestMoveUci;
            case BLUNDER -> "Blunder! Lost " + String.format("%.1f", loss) + "% win chance. Engine recommends " + bestMoveUci;
        };
    }
}
