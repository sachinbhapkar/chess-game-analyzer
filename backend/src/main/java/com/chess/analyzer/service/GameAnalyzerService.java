package com.chess.analyzer.service;

import com.chess.analyzer.model.GameAnalysisReport;
import com.chess.analyzer.model.MoveEvaluation;
import com.chess.analyzer.model.MoveJudgment;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.PieceType;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameAnalyzerService {

    private final StockfishService stockfishService;

    private static final Pattern HEADER_PATTERN = Pattern.compile("^\\[.*?\\]\\s*", Pattern.MULTILINE);
    private static final Pattern COMMENT_PATTERN = Pattern.compile("\\{.*?\\}");
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

        int whiteBrilliant = 0, blackBrilliant = 0;
        int whiteGreat = 0, blackGreat = 0;
        int whiteBest = 0, blackBest = 0;
        int whiteExcellent = 0, blackExcellent = 0;
        int whiteGood = 0, blackGood = 0;
        int whiteBook = 0, blackBook = 0;
        int whiteForced = 0, blackForced = 0;
        int whiteInaccuracy = 0, blackInaccuracy = 0;
        int whiteMistake = 0, blackMistake = 0;
        int whiteMissedWin = 0, blackMissedWin = 0;
        int whiteBlunder = 0, blackBlunder = 0;

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

                // Legal moves count before move was played
                int legalMovesCount = board.legalMoves().size();
                Piece movingPiece = board.getPiece(move.getFrom());

                // Convert move to SAN & UCI
                String san = moveList.toSanArray()[i];
                String uci = move.toString().toLowerCase();
                String fromSquare = move.getFrom().value().toLowerCase();
                String toSquare = move.getTo().value().toLowerCase();
                boolean isCheck = san.contains("+") || san.contains("#");
                boolean isCapture = san.contains("x");

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
                double winChanceAfter = san.contains("#") ? 100.0 : calculateWinChance(scoreAfter, mateAfter, isWhite);
                double winChanceLoss = san.contains("#") ? 0.0 : Math.max(0.0, winChanceBefore - winChanceAfter);

                // Centipawn loss
                double cpl = calculateCentipawnLoss(bestScoreBefore, scoreAfter, isWhite);

                // Classify move with full Chess.com hierarchy
                boolean isExactBest = uci.equalsIgnoreCase(bestMoveUci);
                MoveJudgment judgment;

                if (san.contains("#")) {
                    judgment = MoveJudgment.BEST;
                } else if (legalMovesCount <= 1) {
                    judgment = MoveJudgment.FORCED;
                } else if (winChanceBefore > 75.0 && winChanceAfter < 55.0 && (bestMateBefore != null || (bestScoreBefore != null && Math.abs(bestScoreBefore) >= 2.5))) {
                    // Missed an opportunity to seal victory
                    judgment = MoveJudgment.MISSED_WIN;
                } else if (winChanceLoss >= 25.0 || cpl >= 220.0) {
                    judgment = MoveJudgment.BLUNDER;
                } else if (winChanceLoss >= 14.0 || cpl >= 110.0) {
                    judgment = MoveJudgment.MISTAKE;
                } else if (winChanceLoss >= 6.5 || cpl >= 55.0) {
                    judgment = MoveJudgment.INACCURACY;
                } else if (i < 8 && winChanceLoss < 2.5) {
                    // Opening book moves
                    judgment = MoveJudgment.BOOK;
                } else if (isExactBest) {
                    // Check for Brilliant move: sacrifice of major/minor piece maintaining winning position
                    boolean isPieceSacrifice = movingPiece != null &&
                            movingPiece.getPieceType() != PieceType.PAWN &&
                            isPieceUnderAttack(board, move.getTo(), isWhite);

                    if (isPieceSacrifice && winChanceAfter >= 60.0 && i > 12) {
                        judgment = MoveJudgment.BRILLIANT;
                    } else if (winChanceBefore < 60.0 && winChanceAfter > 75.0) {
                        // Turned the game around with the sole best move
                        judgment = MoveJudgment.GREAT;
                    } else {
                        judgment = MoveJudgment.BEST;
                    }
                } else if (winChanceLoss < 1.5) {
                    judgment = MoveJudgment.EXCELLENT;
                } else if (winChanceLoss < 4.5) {
                    judgment = MoveJudgment.GOOD;
                } else {
                    judgment = MoveJudgment.INACCURACY;
                }

                // Update aggregate stats
                if (isWhite) {
                    whiteMoveCount++;
                    whiteTotalLoss += winChanceLoss;
                    whiteTotalCpl += cpl;
                    switch (judgment) {
                        case BRILLIANT -> whiteBrilliant++;
                        case GREAT -> whiteGreat++;
                        case BEST -> whiteBest++;
                        case EXCELLENT -> whiteExcellent++;
                        case GOOD -> whiteGood++;
                        case BOOK -> whiteBook++;
                        case FORCED -> whiteForced++;
                        case INACCURACY -> whiteInaccuracy++;
                        case MISTAKE -> whiteMistake++;
                        case MISSED_WIN -> whiteMissedWin++;
                        case BLUNDER -> whiteBlunder++;
                    }
                } else {
                    blackMoveCount++;
                    blackTotalLoss += winChanceLoss;
                    blackTotalCpl += cpl;
                    switch (judgment) {
                        case BRILLIANT -> blackBrilliant++;
                        case GREAT -> blackGreat++;
                        case BEST -> blackBest++;
                        case EXCELLENT -> blackExcellent++;
                        case GOOD -> blackGood++;
                        case BOOK -> blackBook++;
                        case FORCED -> blackForced++;
                        case INACCURACY -> blackInaccuracy++;
                        case MISTAKE -> blackMistake++;
                        case MISSED_WIN -> blackMissedWin++;
                        case BLUNDER -> blackBlunder++;
                    }
                }

                MoveEvaluation eval = MoveEvaluation.builder()
                        .ply(ply)
                        .moveNumber(moveNumber)
                        .playerColor(playerColor)
                        .san(san)
                        .uci(uci)
                        .fromSquare(fromSquare)
                        .toSquare(toSquare)
                        .isCheck(isCheck)
                        .isCapture(isCapture)
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
                .opening(opening != null ? opening : "Standard Opening")
                .result(result != null ? result : "*")
                .pgn(pgn)
                .whiteAccuracy(Math.round(whiteAccuracy * 10.0) / 10.0)
                .blackAccuracy(Math.round(blackAccuracy * 10.0) / 10.0)
                .whiteBrilliantMoves(whiteBrilliant)
                .blackBrilliantMoves(blackBrilliant)
                .whiteGreatMoves(whiteGreat)
                .blackGreatMoves(blackGreat)
                .whiteBestMoves(whiteBest)
                .blackBestMoves(blackBest)
                .whiteExcellentMoves(whiteExcellent)
                .blackExcellentMoves(blackExcellent)
                .whiteGoodMoves(whiteGood)
                .blackGoodMoves(blackGood)
                .whiteBookMoves(whiteBook)
                .blackBookMoves(blackBook)
                .whiteForcedMoves(whiteForced)
                .blackForcedMoves(blackForced)
                .whiteInaccuracies(whiteInaccuracy)
                .blackInaccuracies(blackInaccuracy)
                .whiteMistakes(whiteMistake)
                .blackMistakes(blackMistake)
                .whiteMissedWins(whiteMissedWin)
                .blackMissedWins(blackMissedWin)
                .whiteBlunders(whiteBlunder)
                .blackBlunders(blackBlunder)
                .whiteAcpl(Math.round(whiteAcpl * 10.0) / 10.0)
                .blackAcpl(Math.round(blackAcpl * 10.0) / 10.0)
                .moves(evaluations)
                .build();
    }

    private boolean isPieceUnderAttack(Board board, com.github.bhlangonijr.chesslib.Square sq, boolean forWhite) {
        Side opponentSide = forWhite ? Side.BLACK : Side.WHITE;
        return board.isSquareAttackedBy(List.of(sq), opponentSide);
    }

    private String cleanPgnMoves(String pgn) {
        String withoutHeaders = HEADER_PATTERN.matcher(pgn).replaceAll("");
        String withoutComments = COMMENT_PATTERN.matcher(withoutHeaders).replaceAll(" ");
        String withoutResult = RESULT_PATTERN.matcher(withoutComments.trim()).replaceAll(" ");
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

        double playerPawns = forWhite ? pawns : -pawns;
        double centipawns = playerPawns * 100.0;
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
        double acc = 100.0 - (avgLoss * 2.2);
        return Math.max(10.0, Math.min(100.0, acc));
    }

    private String buildExplanation(MoveJudgment judgment, String san, String bestMoveUci, double loss) {
        return switch (judgment) {
            case BRILLIANT -> "Brilliant sacrifice! You found a stunning tactical breakthrough.";
            case GREAT -> "Great move! You found the critical continuation to maintain the advantage.";
            case BEST -> "Best move found by the engine.";
            case EXCELLENT -> "Strong practical choice, maintaining top evaluation.";
            case GOOD -> "Decent move, position remains stable.";
            case BOOK -> "Standard opening book move from known theory.";
            case FORCED -> "Forced move — the only viable legal response.";
            case INACCURACY -> "Inaccuracy (-" + String.format("%.1f", loss) + "% win chance). Best was " + bestMoveUci;
            case MISTAKE -> "Mistake (-" + String.format("%.1f", loss) + "% win chance). The engine preferred " + bestMoveUci;
            case MISSED_WIN -> "Missed Win! You had a decisive winning advantage. Engine recommends " + bestMoveUci;
            case BLUNDER -> "Blunder! Lost " + String.format("%.1f", loss) + "% win chance. Stockfish found " + bestMoveUci;
        };
    }
}
