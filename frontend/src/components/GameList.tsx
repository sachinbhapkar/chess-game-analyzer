import React from 'react';
import { Clock, Compass, Sparkles } from 'lucide-react';
import { ChessRook } from './ChessIcons';
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
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Win
        </span>
      );
    } else if (
      result === 'checkmated' ||
      result === 'resigned' ||
      result === 'timeout' ||
      result === 'abandoned'
    ) {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
          Loss
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-[#1e1c19] text-[#c3c2c1] border border-[#3d3b38]">
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
    <div className="bg-[#262421] border border-[#3d3b38] rounded-2xl p-6 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c]">
              <ChessRook size={16} />
            </div>
            <span>Match Archives</span>
          </h3>
          <p className="text-xs text-[#a09e9a] mt-0.5">
            Select any match below to initiate deep Stockfish Game Review
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-[#1e1c19] text-[#c3c2c1] border border-[#3d3b38]">
          {games.length} Games
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {games.map((game, index) => {
          const isAnalyzing = analyzingGameId === (game.id || String(index));
          const isUserWhite = game.whiteUsername.toLowerCase() === activeUsername.toLowerCase();

          return (
            <div
              key={game.id || index}
              className="bg-[#1e1c19] border border-[#3d3b38] hover:border-[#81b64c]/60 p-4 rounded-xl flex flex-col justify-between transition group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#a09e9a]">
                    <Clock className="w-3.5 h-3.5 text-[#8b8987]" />
                    <span className="capitalize font-semibold text-[#c3c2c1]">
                      {game.timeClass || 'chess'} ({game.timeControl}s)
                    </span>
                  </div>
                  {getResultBadge(game)}
                </div>

                <div className="space-y-2 mb-3 text-sm">
                  {/* White player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 inline-block shadow-sm" />
                      <span
                        className={`font-semibold ${
                          isUserWhite ? 'text-[#81b64c] font-bold' : 'text-white'
                        }`}
                      >
                        {game.whiteUsername}
                      </span>
                    </div>
                    <span className="text-xs text-[#a09e9a] font-mono font-semibold">
                      {game.whiteRating || '????'}
                    </span>
                  </div>

                  {/* Black player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 inline-block shadow-sm" />
                      <span
                        className={`font-semibold ${
                          !isUserWhite ? 'text-[#81b64c] font-bold' : 'text-white'
                        }`}
                      >
                        {game.blackUsername}
                      </span>
                    </div>
                    <span className="text-xs text-[#a09e9a] font-mono font-semibold">
                      {game.blackRating || '????'}
                    </span>
                  </div>
                </div>

                {game.opening && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a09e9a] truncate mb-3 bg-[#262421] px-2.5 py-1.5 rounded-lg border border-[#3d3b38]">
                    <Compass className="w-3.5 h-3.5 text-[#8b8987] shrink-0" />
                    <span className="truncate">{game.opening}</span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-[#3d3b38] flex items-center justify-between">
                <span className="text-[11px] text-[#8b8987] font-medium">{formatDate(game.endTime)}</span>
                <button
                  onClick={() => onSelectGame(game)}
                  disabled={isAnalyzing}
                  className="chess-btn-green flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Evaluating...' : 'Review Game'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
