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
    <div className="min-h-screen bg-[#302e2b] text-[#e2e1e0] flex flex-col font-sans">
      <Navbar
        onOpenPgnModal={() => setIsPgnModalOpen(true)}
        stockfishReady={stockfishReady}
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
          <div className="mb-8 animate-in fade-in duration-200">
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

        {/* Empty State / Welcome Screen in Chess.com Card Style */}
        {!profile && !currentReport && (
          <div className="py-16 text-center max-w-lg mx-auto border border-[#3d3b38] rounded-2xl p-8 bg-[#262421] shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/40 text-[#81b64c] mx-auto flex items-center justify-center mb-4 shadow">
              <ChessKing size={30} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Chess Game Review
            </h3>
            <p className="text-xs text-[#a09e9a] mb-6 leading-relaxed">
              Search any Chess.com username above to browse your games, review accuracy, detect blunders,
              and see engine best moves right on the board.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handlePlayerSearch('sachinbhapkar')}
                className="chess-btn-green w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Sparkles size={14} />
                <span>Try user: sachinbhapkar</span>
              </button>

              <button
                onClick={() => handlePlayerSearch('hikaru')}
                className="chess-btn-secondary w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChessKnight size={14} />
                <span>GM Hikaru Nakamura</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Custom PGN Modal */}
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
