package com.chess.analyzer.service;

import com.chess.analyzer.model.EngineInfo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class EngineRegistryService {

    @Value("${stockfish.path:/opt/homebrew/bin/stockfish}")
    private String customStockfishPath;

    private final Map<String, EngineInfo> engineRegistry = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refreshEngines();
    }

    public synchronized void refreshEngines() {
        engineRegistry.clear();

        // 1. Stockfish (NNUE, World #1)
        registerEngine(EngineInfo.builder()
                .id("stockfish")
                .name("Stockfish 19")
                .version("19")
                .tagline("World Champion NNUE Evaluation Engine")
                .description("The world's highest-rated chess engine (3550+ ELO), powered by Efficiently Updatable Neural Networks (NNUE).")
                .author("Stockfish Developers")
                .type("NNUE")
                .rating("3550+ ELO")
                .installCommand("brew install stockfish")
                .projectUrl("https://stockfishchess.org")
                .defaultDepth(10)
                .defaultMovetimeMs(0)
                .isDefault(true)
                .build(),
                new String[]{customStockfishPath, "/opt/homebrew/bin/stockfish", "/usr/local/bin/stockfish", "/usr/bin/stockfish", "stockfish"}
        );

        // 2. Leela Chess Zero (Lc0 - Deep Neural Net / AlphaZero MCTS)
        registerEngine(EngineInfo.builder()
                .id("lc0")
                .name("Leela Chess Zero (Lc0)")
                .version("0.32.1")
                .tagline("Deep Neural Network & MCTS (AlphaZero Architecture)")
                .description("Open-source neural network chess engine using Monte Carlo Tree Search, accelerated with Apple Silicon Metal.")
                .author("The LCZero Authors")
                .type("Deep Neural Network (MCTS)")
                .rating("3450+ ELO")
                .installCommand("brew install lc0")
                .projectUrl("https://lczero.org")
                .defaultDepth(6)
                .defaultMovetimeMs(0)
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/lc0", "/usr/local/bin/lc0", "/usr/bin/lc0", "lc0"}
        );

        // 3. Fairy-Stockfish (Multi-Variant & Standard Chess)
        registerEngine(EngineInfo.builder()
                .id("fairy-stockfish")
                .name("Fairy-Stockfish")
                .version("14.0.1")
                .tagline("Versatile Engine for Standard Chess & Variants")
                .description("High-performance open-source engine based on Stockfish, supporting standard chess and over 50 chess variants.")
                .author("Fabian Fichter")
                .type("NNUE / Multi-Variant")
                .rating("3450+ ELO")
                .installCommand("brew install fairy-stockfish")
                .projectUrl("https://fairy-stockfish.github.io")
                .defaultDepth(10)
                .defaultMovetimeMs(0)
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/fairy-stockfish", "/usr/local/bin/fairy-stockfish", "/usr/bin/fairy-stockfish", "fairy-stockfish"}
        );

        // 4. Berserk (Top TCEC open-source engine)
        registerEngine(EngineInfo.builder()
                .id("berserk")
                .name("Berserk")
                .version("13.0")
                .tagline("Elite Open-Source NNUE Chess Engine")
                .description("Ranked in the top tier of TCEC and CCRL tournaments with an aggressive and dynamic tactical style.")
                .author("Jay Honnold")
                .type("NNUE")
                .rating("3400+ ELO")
                .installCommand("git clone https://github.com/jhonnold/berserk.git && cd berserk/src && make")
                .projectUrl("https://github.com/jhonnold/berserk/releases")
                .defaultDepth(10)
                .defaultMovetimeMs(0)
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/berserk", "/usr/local/bin/berserk", "/usr/bin/berserk", "berserk"}
        );

        // 5. Koivisto
        registerEngine(EngineInfo.builder()
                .id("koivisto")
                .name("Koivisto")
                .version("9.2")
                .tagline("High-Performance Open-Source NNUE Engine")
                .description("Fast and tactical open-source engine written in C++, featuring custom NNUE architecture and modern search algorithms.")
                .author("Finn Eggers & Kim Kahre")
                .type("NNUE")
                .rating("3400+ ELO")
                .installCommand("curl -L -o koivisto https://github.com/kz04px/koivisto/releases/latest/download/koivisto && chmod +x koivisto")
                .projectUrl("https://github.com/kz04px/koivisto/releases")
                .defaultDepth(10)
                .defaultMovetimeMs(0)
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/koivisto", "/usr/local/bin/koivisto", "/usr/bin/koivisto", "koivisto"}
        );

        // 6. Ethereal
        registerEngine(EngineInfo.builder()
                .id("ethereal")
                .name("Ethereal")
                .version("14.25")
                .tagline("Leading Open-Source Alpha-Beta & NNUE Engine")
                .description("A premier open-source chess engine known for its clean codebase, research-driven heuristics, and high rating.")
                .author("Andrew Grant")
                .type("NNUE")
                .rating("3350+ ELO")
                .installCommand("git clone https://github.com/AndyGrant/Ethereal.git && cd Ethereal/src && make")
                .projectUrl("https://github.com/AndyGrant/Ethereal/releases")
                .defaultDepth(10)
                .defaultMovetimeMs(0)
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/ethereal", "/usr/local/bin/ethereal", "/usr/bin/ethereal", "ethereal"}
        );

        // 7. GNU Chess
        registerEngine(EngineInfo.builder()
                .id("gnuchess")
                .name("GNU Chess")
                .version("6.3.0")
                .tagline("Historic Classic Open-Source Chess Engine")
                .description("The legendary GNU project chess engine, providing classical alpha-beta minimax evaluation.")
                .author("Free Software Foundation")
                .type("Classical Minimax")
                .rating("~2800 ELO")
                .installCommand("brew install gnu-chess")
                .projectUrl("https://www.gnu.org/software/chess")
                .defaultDepth(8)
                .defaultMovetimeMs(0)
                .launchArgs(List.of("-u"))
                .isDefault(false)
                .build(),
                new String[]{"/opt/homebrew/bin/gnuchess", "/usr/local/bin/gnuchess", "gnuchess"}
        );

        log.info("Initialized Engine Registry with {} engines. Available on this system: {}",
                engineRegistry.size(),
                engineRegistry.values().stream().filter(EngineInfo::isAvailable).map(EngineInfo::getName).toList());
    }

    private void registerEngine(EngineInfo info, String[] candidatePaths) {
        String resolvedBinary = null;
        for (String path : candidatePaths) {
            if (path == null || path.isEmpty()) continue;
            try {
                File f = new File(path);
                if (f.exists() && f.canExecute()) {
                    resolvedBinary = f.getAbsolutePath();
                    break;
                }
            } catch (Exception ignored) {
            }
        }

        if (resolvedBinary != null) {
            info.setAvailable(true);
            info.setBinaryPath(resolvedBinary);
        } else {
            info.setAvailable(false);
            info.setBinaryPath(null);
        }

        engineRegistry.put(info.getId().toLowerCase(), info);
    }

    public List<EngineInfo> getAllEngines() {
        return new ArrayList<>(engineRegistry.values());
    }

    public List<EngineInfo> getAvailableEngines() {
        return engineRegistry.values().stream()
                .filter(EngineInfo::isAvailable)
                .toList();
    }

    public EngineInfo getEngine(String id) {
        if (id == null || id.trim().isEmpty()) {
            return getDefaultEngine();
        }
        EngineInfo info = engineRegistry.get(id.toLowerCase().trim());
        if (info != null && info.isAvailable()) {
            return info;
        }
        // If specified engine is not available or not found, fall back to default
        log.warn("Engine '{}' not found or unavailable, falling back to default engine", id);
        return getDefaultEngine();
    }

    public EngineInfo getDefaultEngine() {
        EngineInfo stockfish = engineRegistry.get("stockfish");
        if (stockfish != null && stockfish.isAvailable()) {
            return stockfish;
        }
        return engineRegistry.values().stream()
                .filter(EngineInfo::isAvailable)
                .findFirst()
                .orElse(stockfish);
    }
}
