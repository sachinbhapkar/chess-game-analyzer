import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerSearch } from './components/PlayerSearch';
import { GameList } from './components/GameList';
import { AnalysisWorkbench } from './components/AnalysisWorkbench';
import { PgnModal } from './components/PgnModal';
import { ChessKing, ChessKnight } from './components/ChessIcons';
import type { GameAnalysisReport, GameSummary, PlayerProfile } from './types/chess';
import { analyzeGamePgn, checkBackendHealth, fetchPlayerProfile, fetchRecentGames } from './services/api';
import { AlertCircle, Sparkles } from 'lucide-react';

export function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [currentReport, setCurrentReport] = useState<GameAnalysisReport | null>(null);

  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [analyzingGameId, setAnalyzingGameId] = useState<string | null>(null);
  const [stockfishReady, setStockfishReady] = useState(false);
  const [isPgnModalOpen, setIsPgnModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check backend & Stockfish health on mount
  useEffect(() => {
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

    setAnalyzingGameId(game.id);
    setErrorMessage(null);

    try {
      const report = await analyzeGamePgn(game.pgn, 12, 140);
      setCurrentReport(report);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Check if Stockfish backend is running.');
    } finally {
      setAnalyzingGameId(null);
    }
  };

  // Handle Custom PGN Analysis
  const handleAnalyzeCustomPgn = async (pgn: string) => {
    setAnalyzingGameId('custom');
    setErrorMessage(null);

    try {
      const report = await analyzeGamePgn(pgn, 12, 140);
      setCurrentReport(report);
      setIsPgnModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed for custom PGN.');
    } finally {
      setAnalyzingGameId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar
        onOpenPgnModal={() => setIsPgnModalOpen(true)}
        stockfishReady={stockfishReady}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between text-sm shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:underline text-red-300 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Player Search Section with Autocomplete */}
        <PlayerSearch
          onSearch={handlePlayerSearch}
          profile={profile}
          loading={loadingPlayer}
        />

        {/* Game Analysis Workbench if a game has been analyzed */}
        {currentReport && (
          <div className="mb-10 animate-in fade-in duration-300">
            <AnalysisWorkbench report={currentReport} />
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

        {/* Production-grade welcome hero when no match is open */}
        {!profile && !currentReport && (
          <div className="py-20 text-center max-w-xl mx-auto border border-white/[0.06] rounded-3xl p-10 bg-[#12141a]/60 shadow-2xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-white/10 text-amber-400 mx-auto flex items-center justify-center mb-5 shadow-xl">
              <ChessKing size={32} />
            </div>

            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
              Grandmaster Game Review
            </h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Analyze your games with the world&apos;s strongest chess engine. Detect blunders, mistakes,
              inaccuracies, brilliant moves, and visualize your win-chance momentum over the board.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handlePlayerSearch('hikaru')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try GM Hikaru Nakamura</span>
              </button>

              <button
                onClick={() => setIsPgnModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#15171f] hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ChessKnight size={16} />
                <span>Import PGN</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* PGN Paste Modal */}
      <PgnModal
        isOpen={isPgnModalOpen}
        onClose={() => setIsPgnModalOpen(false)}
        onAnalyze={handleAnalyzeCustomPgn}
        loading={analyzingGameId === 'custom'}
      />
    </div>
  );
}

export default App;
