import React from 'react';
import { Play, Sparkles, Clock, Compass } from 'lucide-react';
import type { GameSummary } from '../types/chess';

interface GameListProps {
  games: GameSummary[];
  analyzingGameId: string | null;
  onSelectGame: (game: GameSummary) => void;
  activeUsername: string;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  analyzingGameId,
  onSelectGame,
  activeUsername,
}) => {
  if (games.length === 0) {
    return null;
  }

  const getResultBadge = (game: GameSummary) => {
    const isWhite = game.whiteUsername.toLowerCase() === activeUsername.toLowerCase();
    const result = isWhite ? game.whiteResult : game.blackResult;

    if (result === 'win') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Win
        </span>
      );
    } else if (result === 'checkmated' || result === 'resigned' || result === 'timeout' || result === 'abandoned') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
          Loss
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-700 text-slate-300 border border-slate-600">
          Draw
        </span>
      );
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            Recent Matches
          </h3>
          <p className="text-xs text-slate-400">Click any game to run Stockfish engine evaluation</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {games.length} Games Loaded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {games.map((game, index) => {
          const isAnalyzing = analyzingGameId === (game.id || String(index));
          const isUserWhite = game.whiteUsername.toLowerCase() === activeUsername.toLowerCase();

          return (
            <div
              key={game.id || index}
              className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl flex flex-col justify-between transition group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="capitalize font-medium text-slate-300">
                      {game.timeClass || 'chess'} ({game.timeControl}s)
                    </span>
                  </div>
                  {getResultBadge(game)}
                </div>

                <div className="space-y-1.5 mb-3 text-sm">
                  {/* White player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400 inline-block" />
                      <span
                        className={`font-semibold ${
                          isUserWhite ? 'text-emerald-400 underline decoration-emerald-500/40' : 'text-slate-200'
                        }`}
                      >
                        {game.whiteUsername}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {game.whiteRating || '????'}
                    </span>
                  </div>

                  {/* Black player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 inline-block" />
                      <span
                        className={`font-semibold ${
                          !isUserWhite ? 'text-emerald-400 underline decoration-emerald-500/40' : 'text-slate-200'
                        }`}
                      >
                        {game.blackUsername}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {game.blackRating || '????'}
                    </span>
                  </div>
                </div>

                {game.opening && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mb-3 bg-slate-900/80 px-2 py-1 rounded">
                    <Compass className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{game.opening}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{formatDate(game.endTime)}</span>
                <button
                  onClick={() => onSelectGame(game)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
