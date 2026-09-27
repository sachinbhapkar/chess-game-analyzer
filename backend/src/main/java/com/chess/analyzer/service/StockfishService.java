package com.chess.analyzer.service;

import com.chess.analyzer.model.EngineInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockfishService {

    private final EngineRegistryService engineRegistryService;

    @Value("${stockfish.path:/opt/homebrew/bin/stockfish}")
    private String configuredPath;

    @Value("${stockfish.depth:10}")
    private int defaultDepth;

    @Value("${stockfish.movetime-ms:0}")
    private int defaultMovetimeMs;

    private static final Pattern SCORE_CP_PATTERN = Pattern.compile("score cp (-?\\d+)");
    private static final Pattern SCORE_MATE_PATTERN = Pattern.compile("score mate (-?\\d+)");
    private static final Pattern BEST_MOVE_PATTERN = Pattern.compile("^bestmove\\s+([a-h][1-8][a-h][1-8][qrbn]?)");

    public String resolveStockfishBinary() {
        EngineInfo defaultEngine = engineRegistryService.getDefaultEngine();
        if (defaultEngine != null && defaultEngine.getBinaryPath() != null) {
            return defaultEngine.getBinaryPath();
        }

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
     * Session-based UCI worker for evaluating moves sequentially with high performance
     * across open-source chess engines (Stockfish, Lc0, Fairy-Stockfish, etc.).
     */
    public class StockfishSession implements AutoCloseable {
        private final EngineInfo engine;
        private final Process process;
        private final BufferedReader reader;
        private final PrintWriter writer;

        public StockfishSession(EngineInfo engineInfo) throws Exception {
            this.engine = engineInfo != null ? engineInfo : engineRegistryService.getDefaultEngine();
            String binaryPath = this.engine != null && this.engine.getBinaryPath() != null
                    ? this.engine.getBinaryPath()
                    : resolveStockfishBinary();

            log.info("Launching chess engine session: {} at {}", this.engine != null ? this.engine.getName() : "Stockfish", binaryPath);

            List<String> cmd = new ArrayList<>();
            cmd.add(binaryPath);
            if (this.engine != null && this.engine.getLaunchArgs() != null && !this.engine.getLaunchArgs().isEmpty()) {
                cmd.addAll(this.engine.getLaunchArgs());
            }

            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            this.process = pb.start();
            this.reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
            this.writer = new PrintWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8), true);

            sendCommand("uci");
            waitFor("uciok", 2500);
            sendCommand("isready");
            waitFor("readyok", 3000);
            sendCommand("ucinewgame");
            sendCommand("isready");
            waitFor("readyok", 3000);
        }

        public EngineInfo getEngine() {
            return engine;
        }

        public void sendCommand(String cmd) {
            writer.println(cmd);
        }

        public void waitFor(String expected, long timeoutMs) throws Exception {
            long deadline = System.currentTimeMillis() + timeoutMs;
            String line;
            while (System.currentTimeMillis() < deadline) {
                if (!process.isAlive()) {
                    throw new IllegalStateException("Chess engine process terminated unexpectedly during startup");
                }
                if (reader.ready()) {
                    line = reader.readLine();
                    if (line != null && line.contains(expected)) {
                        return;
                    }
                } else {
                    Thread.sleep(10);
                }
            }
            throw new TimeoutException("Engine " + (engine != null ? engine.getName() : "Chess Engine") +
                    " failed to respond with '" + expected + "' within " + timeoutMs + "ms");
        }

        public EvaluationResult evaluateFen(String fen, int depth, int movetimeMs) {
            try {
                sendCommand("position fen " + fen);

                // Customize search parameters by engine characteristics
                if (engine != null && "lc0".equalsIgnoreCase(engine.getId())) {
                    // Leela Chess Zero uses deep neural networks where each node is an evaluation.
                    // Nodes 30-50 provides GM-level positional evaluation in ~0.5s per move.
                    int targetNodes = depth > 0 ? Math.min(depth * 5, 50) : 30;
                    sendCommand("go nodes " + targetNodes);
                } else {
                    int targetDepth = depth > 0 ? depth : (engine != null && engine.getDefaultDepth() > 0 ? engine.getDefaultDepth() : defaultDepth);
                    int targetMovetime = movetimeMs > 0 ? movetimeMs : (engine != null && engine.getDefaultMovetimeMs() > 0 ? engine.getDefaultMovetimeMs() : defaultMovetimeMs);
                    if (targetMovetime > 0) {
                        sendCommand("go depth " + targetDepth + " movetime " + targetMovetime);
                    } else {
                        sendCommand("go depth " + targetDepth);
                    }
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

                long maxWait = System.currentTimeMillis() + (movetimeMs > 0 ? movetimeMs + 2000 : 2500);
                String line;
                while (System.currentTimeMillis() < maxWait) {
                    if (!process.isAlive()) {
                        throw new IllegalStateException("Engine process terminated during evaluation");
                    }
                    if (reader.ready()) {
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
                    } else {
                        Thread.sleep(5);
                    }
                }

                // UCI engines output scores from perspective of the side to move. Normalize to White perspective.
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
        return createSession((String) null);
    }

    public StockfishSession createSession(String engineId) throws Exception {
        EngineInfo engine = engineRegistryService.getEngine(engineId);
        return new StockfishSession(engine);
    }

    public StockfishSession createSession(EngineInfo engine) throws Exception {
        return new StockfishSession(engine);
    }

    public int getDefaultDepth() {
        return defaultDepth;
    }

    public int getDefaultMovetimeMs() {
        return defaultMovetimeMs;
    }
}
