package com.chess.analyzer.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class StockfishService {

    @Value("${stockfish.path:/opt/homebrew/bin/stockfish}")
    private String configuredPath;

    @Value("${stockfish.depth:12}")
    private int defaultDepth;

    @Value("${stockfish.movetime-ms:150}")
    private int defaultMovetimeMs;

    private static final Pattern SCORE_CP_PATTERN = Pattern.compile("score cp (-?\\d+)");
    private static final Pattern SCORE_MATE_PATTERN = Pattern.compile("score mate (-?\\d+)");
    private static final Pattern BEST_MOVE_PATTERN = Pattern.compile("^bestmove\\s+([a-h][1-8][a-h][1-8][qrbn]?)");

    public String resolveStockfishBinary() {
        String[] candidates = {
                configuredPath,
                "/opt/homebrew/bin/stockfish",
                "/usr/local/bin/stockfish",
                "/usr/bin/stockfish",
                "stockfish"
        };

        for (String path : candidates) {
            try {
                File f = new File(path);
                if (f.exists() && f.canExecute()) {
                    return path;
                }
            } catch (Exception ignored) {
            }
        }
        return "stockfish";
    }

    public static class EvaluationResult {
        // Score in pawns from White's perspective (+1.25, -0.40)
        private final Double scoreInPawns;
        // Mate in moves from White's perspective (+2 = White mates in 2, -1 = Black mates in 1)
        private final Integer mateIn;
        private final String bestMoveUci;
        private final String evalText;

        public EvaluationResult(Double scoreInPawns, Integer mateIn, String bestMoveUci) {
            this.scoreInPawns = scoreInPawns;
            this.mateIn = mateIn;
            this.bestMoveUci = bestMoveUci;

            if (mateIn != null) {
                if (mateIn > 0) {
                    this.evalText = "M" + mateIn;
                } else {
                    this.evalText = "-M" + Math.abs(mateIn);
                }
            } else if (scoreInPawns != null) {
                this.evalText = (scoreInPawns >= 0 ? "+" : "") + String.format("%.2f", scoreInPawns);
            } else {
                this.evalText = "0.00";
            }
        }

        public Double getScoreInPawns() { return scoreInPawns; }
        public Integer getMateIn() { return mateIn; }
        public String getBestMoveUci() { return bestMoveUci; }
        public String getEvalText() { return evalText; }
    }

    /**
     * Session-based Stockfish worker for evaluating moves sequentially with high performance.
     */
    public class StockfishSession implements AutoCloseable {
        private final Process process;
        private final BufferedReader reader;
        private final PrintWriter writer;

        public StockfishSession() throws Exception {
            String binaryPath = resolveStockfishBinary();
            ProcessBuilder pb = new ProcessBuilder(binaryPath);
            pb.redirectErrorStream(true);
            this.process = pb.start();
            this.reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
            this.writer = new PrintWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8), true);

            sendCommand("uci");
            waitFor("uciok", 3000);
            sendCommand("isready");
            waitFor("readyok", 3000);
            sendCommand("ucinewgame");
            sendCommand("isready");
            waitFor("readyok", 3000);
        }

        public void sendCommand(String cmd) {
            writer.println(cmd);
        }

        public void waitFor(String expected, long timeoutMs) throws Exception {
            long deadline = System.currentTimeMillis() + timeoutMs;
            String line;
            while (System.currentTimeMillis() < deadline) {
                if (reader.ready()) {
                    line = reader.readLine();
                    if (line != null && line.contains(expected)) {
                        return;
                    }
                } else {
                    Thread.sleep(10);
                }
            }
        }

        public EvaluationResult evaluateFen(String fen, int depth, int movetimeMs) {
            try {
                sendCommand("position fen " + fen);
                if (movetimeMs > 0) {
                    sendCommand("go movetime " + movetimeMs);
                } else {
                    sendCommand("go depth " + depth);
                }

                Integer lastCp = null;
                Integer lastMate = null;
                String bestMove = null;

                // Determine whose turn it is from FEN ("w" or "b")
                boolean isWhiteToMove = true;
                String[] fenParts = fen.split(" ");
                if (fenParts.length > 1 && "b".equalsIgnoreCase(fenParts[1])) {
                    isWhiteToMove = false;
                }

                long maxWait = System.currentTimeMillis() + (movetimeMs > 0 ? movetimeMs + 3000 : 8000);
                String line;
                while (System.currentTimeMillis() < maxWait) {
                    line = reader.readLine();
                    if (line == null) break;

                    if (line.contains("score cp ")) {
                        Matcher matcher = SCORE_CP_PATTERN.matcher(line);
                        if (matcher.find()) {
                            lastCp = Integer.parseInt(matcher.group(1));
                            lastMate = null;
                        }
                    } else if (line.contains("score mate ")) {
                        Matcher matcher = SCORE_MATE_PATTERN.matcher(line);
                        if (matcher.find()) {
                            lastMate = Integer.parseInt(matcher.group(1));
                            lastCp = null;
                        }
                    }

                    if (line.startsWith("bestmove")) {
                        Matcher matcher = BEST_MOVE_PATTERN.matcher(line);
                        if (matcher.find()) {
                            bestMove = matcher.group(1);
                        }
                        break;
                    }
                }

                // Stockfish gives score relative to side to move. Normalize to White perspective.
                Double scoreInPawns = null;
                Integer normalizedMate = null;

                if (lastMate != null) {
                    normalizedMate = isWhiteToMove ? lastMate : -lastMate;
                } else if (lastCp != null) {
                    int normalizedCp = isWhiteToMove ? lastCp : -lastCp;
                    scoreInPawns = normalizedCp / 100.0;
                } else {
                    scoreInPawns = 0.0;
                }

                return new EvaluationResult(scoreInPawns, normalizedMate, bestMove);
            } catch (Exception e) {
                log.error("Error evaluating position: {}", fen, e);
                return new EvaluationResult(0.0, null, null);
            }
        }

        @Override
        public void close() {
            try {
                sendCommand("quit");
                process.waitFor(1, TimeUnit.SECONDS);
            } catch (Exception ignored) {
            } finally {
                process.destroyForcibly();
            }
        }
    }

    public StockfishSession createSession() throws Exception {
        return new StockfishSession();
    }

    public int getDefaultDepth() {
        return defaultDepth;
    }

    public int getDefaultMovetimeMs() {
        return defaultMovetimeMs;
    }
}
