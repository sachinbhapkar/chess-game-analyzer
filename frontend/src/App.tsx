import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerSearch } from './components/PlayerSearch';
import { GameList } from './components/GameList';
import { AnalysisWorkbench } from './components/AnalysisWorkbench';
import { PgnModal } from './components/PgnModal';
import type { GameAnalysisReport, GameSummary, PlayerProfile } from './types/chess';
import { analyzeGamePgn, checkBackendHealth, fetchPlayerProfile, fetchRecentGames } from './services/api';
import { AlertCircle, Swords } from 'lucide-react';

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
      const report = await analyzeGamePgn(game.pgn, 10, 120);
      setCurrentReport(report);
      // Smooth scroll to workbench
      window.scrollTo({ top: 350, behavior: 'smooth' });
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
      const report = await analyzeGamePgn(pgn, 10, 120);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenPgnModal={() => setIsPgnModalOpen(true)}
        stockfishReady={stockfishReady}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:underline text-red-300 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Player Search Section */}
        <PlayerSearch
          onSearch={handlePlayerSearch}
          profile={profile}
          loading={loadingPlayer}
        />

        {/* Game Analysis Workbench if a game has been analyzed */}
        {currentReport && (
          <div className="mb-8">
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

        {/* Empty state welcome prompt if no profile loaded yet */}
        {!profile && !currentReport && (
          <div className="py-16 text-center max-w-lg mx-auto border border-dashed border-slate-800 rounded-3xl p-8 bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <Swords className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Enter any Chess.com username above to browse match archives, evaluate blunders, mistakes,
              and view full move-by-move Stockfish accuracy.
            </p>
            <button
              onClick={() => handlePlayerSearch('hikaru')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              Try with GM Hikaru Nakamura
            </button>
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
