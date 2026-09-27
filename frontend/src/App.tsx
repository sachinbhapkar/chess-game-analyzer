import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerSearch } from './components/PlayerSearch';
import { GameList } from './components/GameList';
import { AnalysisWorkbench } from './components/AnalysisWorkbench';
import { PgnModal } from './components/PgnModal';
import { EngineSelectorModal } from './components/EngineSelectorModal';
import { ChessKing, ChessKnight } from './components/ChessIcons';
import type { EngineInfo, GameAnalysisReport, GameSummary, PlayerProfile } from './types/chess';
import {
  analyzeGamePgn,
  checkBackendHealth,
  fetchEngines,
  fetchPlayerProfile,
  fetchRecentGames,
} from './services/api';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [currentReport, setCurrentReport] = useState<GameAnalysisReport | null>(null);

  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [selectedEngineId, setSelectedEngineId] = useState<string>(() => {
    return localStorage.getItem('selected_chess_engine') || 'stockfish';
  });
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);

  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [analyzingGameId, setAnalyzingGameId] = useState<string | null>(null);
  const [stockfishReady, setStockfishReady] = useState(false);
  const [isPgnModalOpen, setIsPgnModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workbenchRef = useRef<HTMLDivElement>(null);

  const loadEngines = async () => {
    try {
      const data = await fetchEngines();
      setEngines(data);
    } catch {
      // Fallback
    }
  };

  // Check backend & engines health on mount
  useEffect(() => {
    loadEngines();
    checkBackendHealth()
      .then((data) => {
        if (data.status === 'UP') {
          setStockfishReady(true);
        }
      })
      .catch(() => {
        setStockfishReady(false);
      });
  }, []);

  const activeEngine = engines.find((e) => e.id === selectedEngineId) || engines[0] || null;

  const handleSelectEngine = async (engineId: string) => {
    setSelectedEngineId(engineId);
    localStorage.setItem('selected_chess_engine', engineId);
    setIsEngineModalOpen(false);

    // If an analysis report is already open, seamlessly re-analyze it with the newly chosen engine
    if (currentReport?.pgn) {
      await handleAnalyzeCustomPgn(currentReport.pgn, engineId);
    }
  };

  // Handle Player Search
  const handlePlayerSearch = async (username: string) => {
    setLoadingPlayer(true);
    setErrorMessage(null);
    try {
      const [playerData, gamesData] = await Promise.all([
        fetchPlayerProfile(username),
        fetchRecentGames(username, 15),
      ]);
      setProfile(playerData);
      setGames(gamesData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch player data');
    } finally {
      setLoadingPlayer(false);
    }
  };

  // Handle Game Selection for Analysis
  const handleSelectGame = async (game: GameSummary) => {
    if (!game.pgn) {
      setErrorMessage('This game has no PGN available to analyze.');
      return;
    }

    setAnalyzingGameId(game.id || 'current');
    setErrorMessage(null);

    try {
      const report = await analyzeGamePgn(game.pgn, 10, 0, selectedEngineId);
      setCurrentReport(report);
      setTimeout(() => {
        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Check if engine backend is running.');
    } finally {
      setAnalyzingGameId(null);
    }
  };

  // Handle Custom PGN Analysis
  const handleAnalyzeCustomPgn = async (pgn: string, engineToUse?: string) => {
    const engine = engineToUse || selectedEngineId;
    setAnalyzingGameId('custom');
    setErrorMessage(null);

    try {
      const report = await analyzeGamePgn(pgn, 10, 0, engine);
      setCurrentReport(report);
      setIsPgnModalOpen(false);
      setTimeout(() => {
        workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed for custom PGN.');
    } finally {
      setAnalyzingGameId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e1e0] flex flex-col font-sans relative selection:bg-[#81b64c] selection:text-white">
      <Navbar
        onOpenPgnModal={() => setIsPgnModalOpen(true)}
        stockfishReady={stockfishReady}
        activeEngine={activeEngine}
        onOpenEngineModal={() => setIsEngineModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-[#ca3431]/15 border border-[#ca3431]/40 text-[#fca5a5] flex items-center justify-between text-sm shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:underline text-white font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Player Search Section with Instant Autocomplete */}
        <PlayerSearch
          onSearch={handlePlayerSearch}
          profile={profile}
          loading={loadingPlayer}
        />

        {/* Game Analysis Workbench if a game has been analyzed */}
        {currentReport && (
          <div ref={workbenchRef} className="mb-8 animate-in fade-in duration-200 scroll-mt-20">
            <AnalysisWorkbench
              report={currentReport}
              onOpenEngineModal={() => setIsEngineModalOpen(true)}
            />
          </div>
        )}

        {/* Recent Games List */}
        {profile && (
          <GameList
            games={games}
            analyzingGameId={analyzingGameId}
            onSelectGame={handleSelectGame}
            activeUsername={profile.username}
          />
        )}

        {/* Empty State / Welcome Screen in Chess.com Card Style */}
        {!profile && !currentReport && (
          <div className="py-14 text-center max-w-xl mx-auto border border-[#3d3b38]/80 rounded-2xl p-8 bg-[#262421]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Top ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-[#81b64c]/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-[#81b64c] to-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <img
                  src="/icons/royal-king.jpg"
                  alt="Chess Royal King"
                  className="w-full h-full object-cover rounded-xl shadow-inner"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#81b64c]/15 border border-[#81b64c]/30 text-[#81b64c] text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} />
                <span>Next-Gen Chess Evaluation</span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                Master Your Chess Games
              </h3>
              <p className="text-xs text-[#a09e9a] mb-7 leading-relaxed max-w-md mx-auto">
                Search any Chess.com player above to browse match archives, evaluate move accuracy with Stockfish or Leela Chess Zero, detect critical blunders, and explore Grandmaster best lines.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handlePlayerSearch('sachin-bhapkar')}
                  className="chess-btn-green w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles size={14} />
                  <span>Try user: sachin-bhapkar</span>
                </button>

                <button
                  onClick={() => handlePlayerSearch('hikaru')}
                  className="chess-btn-secondary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChessKnight size={16} />
                  <span>GM Hikaru Nakamura</span>
                </button>

                <button
                  onClick={() => handlePlayerSearch('magnuscarlsen')}
                  className="chess-btn-secondary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChessKing size={16} />
                  <span>Magnus Carlsen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Loading Evaluation Modal Overlay */}
      {analyzingGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#262421] border border-[#3d3b38] rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c] mb-4">
              <Loader2 size={30} className="animate-spin text-[#81b64c]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Running Game Review</h3>
            <p className="text-xs text-[#a09e9a] mb-5 leading-relaxed">
              {activeEngine ? activeEngine.name : 'Stockfish 19'} is evaluating all moves, finding blunders, and computing accuracy...
            </p>
            <div className="w-full bg-[#1e1c19] h-2 rounded-full overflow-hidden border border-[#3d3b38]">
              <div className="h-full bg-[#81b64c] rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Custom PGN Modal */}
      <PgnModal
        isOpen={isPgnModalOpen}
        onClose={() => setIsPgnModalOpen(false)}
        onAnalyze={(pgn) => handleAnalyzeCustomPgn(pgn)}
        loading={analyzingGameId === 'custom'}
      />

      {/* Open-Source Engine Selection Modal */}
      <EngineSelectorModal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        engines={engines}
        selectedEngineId={selectedEngineId}
        onSelectEngine={handleSelectEngine}
        onRefreshEngines={loadEngines}
      />
    </div>
  );
}

export default App;
