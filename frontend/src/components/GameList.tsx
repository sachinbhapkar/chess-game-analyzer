import React from 'react';
import { Clock, Zap, Sparkles, Compass, Trophy, Crown, Calendar, ShieldAlert } from 'lucide-react';
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

  const getOutcome = (game: GameSummary) => {
    const isUserWhite = game.whiteUsername.toLowerCase() === activeUsername.toLowerCase();
    const result = isUserWhite ? game.whiteResult : game.blackResult;

    if (result === 'win') return 'win';
    if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) return 'loss';
    return 'draw';
  };

  const getTerminationReason = (whiteRes: string, blackRes: string) => {
    const loserRes = whiteRes === 'win' ? blackRes : whiteRes;
    switch (loserRes) {
      case 'checkmated':
        return 'Checkmate';
      case 'resigned':
        return 'Resignation';
      case 'timeout':
        return 'Time out';
      case 'abandoned':
        return 'Abandoned';
      case 'stalemate':
        return 'Stalemate';
      case 'repetition':
        return '3-fold Repetition';
      case 'agreed':
        return 'Agreement';
      case 'timevsinsufficient':
        return 'Timeout vs Insufficient';
      default:
        return loserRes || 'Ended';
    }
  };

  const getTimeClassBadge = (timeClass: string, timeControl: string) => {
    const cls = timeClass?.toLowerCase() || 'chess';
    let label = `${timeControl}s`;
    const numSec = parseInt(timeControl, 10);
    if (!isNaN(numSec)) {
      if (numSec >= 60 && numSec % 60 === 0) {
        label = `${numSec / 60} min`;
      } else if (numSec >= 60) {
        label = `${Math.floor(numSec / 60)}m ${numSec % 60}s`;
      }
    }

    if (cls === 'blitz') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
          <Zap size={12} className="fill-amber-400 text-amber-400" />
          <span>Blitz • {label}</span>
        </span>
      );
    } else if (cls === 'bullet') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm">
          <Zap size={12} className="fill-orange-400 text-orange-400" />
          <span>Bullet • {label}</span>
        </span>
      );
    } else if (cls === 'rapid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <Clock size={12} />
          <span>Rapid • {label}</span>
        </span>
      );
    } else if (cls === 'daily') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm">
          <Calendar size={12} />
          <span>Daily • {label}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-slate-700/30 text-slate-300 border border-slate-600/40 shadow-sm">
          <Clock size={12} />
          <span>{cls} • {label}</span>
        </span>
      );
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[#262421]/90 backdrop-blur-xl border border-[#3d3b38]/80 rounded-2xl p-6 shadow-2xl mb-8 relative overflow-hidden">
      {/* Top subtle ambient glow */}
      <div className="absolute top-0 left-1/3 w-96 h-20 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-black/40 border border-amber-500/40 shrink-0 bg-[#1e1c19] p-0.5 hover:scale-105 transition-transform duration-200">
            <img
              src="/icons/match-archives.jpg"
              alt="Match Archives"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Match Archives & History
            </h3>
            <p className="text-xs text-[#a09e9a]">
              Select any game below to run full AI Game Review with Stockfish engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#1e1c19] text-emerald-400 border border-emerald-500/30 shadow-sm flex items-center gap-1.5">
            <Trophy size={13} />
            <span>{games.length} Recent Games</span>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, index) => {
          const isAnalyzing = analyzingGameId === (game.id || String(index));
          const isUserWhite = game.whiteUsername.toLowerCase() === activeUsername.toLowerCase();
          const outcome = getOutcome(game);

          const whiteScore =
            game.whiteResult === 'win' ? '1' : game.blackResult === 'win' ? '0' : '½';
          const blackScore =
            game.blackResult === 'win' ? '1' : game.whiteResult === 'win' ? '0' : '½';

          const termination = getTerminationReason(game.whiteResult, game.blackResult);

          // Card theme styling according to Win/Loss/Draw
          let borderAccent = 'border-[#3d3b38] hover:border-[#81b64c]/70';
          let gradientBg = 'bg-[#1e1c19]';
          let indicatorBar = 'bg-slate-500';

          if (outcome === 'win') {
            borderAccent = 'border-emerald-500/35 hover:border-emerald-400 hover:shadow-[0_8px_24px_rgba(16,185,129,0.2)]';
            gradientBg = 'bg-gradient-to-br from-[#1a2e22]/60 via-[#1e1c19] to-[#1c1a17]';
            indicatorBar = 'bg-gradient-to-b from-emerald-400 to-[#81b64c] shadow-[0_0_8px_rgba(16,185,129,0.7)]';
          } else if (outcome === 'loss') {
            borderAccent = 'border-rose-500/35 hover:border-rose-400 hover:shadow-[0_8px_24px_rgba(244,63,94,0.2)]';
            gradientBg = 'bg-gradient-to-br from-[#301c22]/60 via-[#1e1c19] to-[#1c1a17]';
            indicatorBar = 'bg-gradient-to-b from-rose-400 to-red-600 shadow-[0_0_8px_rgba(244,63,94,0.7)]';
          } else {
            borderAccent = 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_8px_24px_rgba(245,158,11,0.15)]';
            gradientBg = 'bg-gradient-to-br from-[#2a241b]/60 via-[#1e1c19] to-[#1c1a17]';
            indicatorBar = 'bg-gradient-to-b from-amber-400 to-yellow-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
          }

          return (
            <div
              key={game.id || index}
              className={`${gradientBg} ${borderAccent} border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group shadow-md hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Left Color-coded Outcome Indicator Line */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${indicatorBar}`}
              />

              <div className="pl-1.5">
                {/* Top Header: Speed Pill & Outcome Badge */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div>{getTimeClassBadge(game.timeClass, game.timeControl)}</div>

                  {outcome === 'win' ? (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-[#81b64c] text-white shadow-md shadow-emerald-500/30 flex items-center gap-1">
                      <Trophy size={11} className="fill-white" />
                      <span>Win</span>
                    </span>
                  ) : outcome === 'loss' ? (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30 flex items-center gap-1">
                      <ShieldAlert size={11} />
                      <span>Loss</span>
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-700/80 text-slate-200 border border-slate-600 shadow-sm">
                      Draw
                    </span>
                  )}
                </div>

                {/* Head-to-Head Players Box */}
                <div className="bg-[#181614]/80 border border-[#3d3b38]/60 rounded-xl p-3 mb-3 space-y-2.5">
                  {/* White Player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] text-slate-900 shadow-sm font-black shrink-0">
                        ♔
                      </span>
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`font-bold text-sm truncate ${
                            isUserWhite
                              ? 'text-[#81b64c] underline decoration-[#81b64c]/40 underline-offset-2'
                              : 'text-white'
                          }`}
                        >
                          {game.whiteUsername}
                        </span>
                        {game.whiteResult === 'win' && (
                          <Crown size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#a09e9a] font-bold bg-[#262421] px-1.5 py-0.5 rounded border border-[#3d3b38]">
                        {game.whiteRating || '—'}
                      </span>
                      <span
                        className={`font-mono text-base font-black w-4 text-right ${
                          game.whiteResult === 'win' ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {whiteScore}
                      </span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-[#2e2c29]" />

                  {/* Black Player */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-[#121110] border border-slate-600 flex items-center justify-center text-[10px] text-white shadow-sm font-black shrink-0">
                        ♚
                      </span>
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`font-bold text-sm truncate ${
                            !isUserWhite
                              ? 'text-[#81b64c] underline decoration-[#81b64c]/40 underline-offset-2'
                              : 'text-white'
                          }`}
                        >
                          {game.blackUsername}
                        </span>
                        {game.blackResult === 'win' && (
                          <Crown size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#a09e9a] font-bold bg-[#262421] px-1.5 py-0.5 rounded border border-[#3d3b38]">
                        {game.blackRating || '—'}
                      </span>
                      <span
                        className={`font-mono text-base font-black w-4 text-right ${
                          game.blackResult === 'win' ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {blackScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opening & Termination Details */}
                <div className="space-y-1.5 mb-3.5 text-xs">
                  {game.opening && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#c3c2c1] truncate bg-[#262421]/90 px-2.5 py-1.5 rounded-lg border border-[#3d3b38]">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-medium">{game.opening}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#8b8987] px-1 font-medium">
                    <span>Result:</span>
                    <span className="font-semibold text-white/90">{termination}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Date & Review CTA */}
              <div className="pt-3 border-t border-[#3d3b38] flex items-center justify-between pl-1.5">
                <span className="text-[11px] text-[#8b8987] font-medium font-mono">
                  {formatDate(game.endTime)}
                </span>

                <button
                  onClick={() => onSelectGame(game)}
                  disabled={isAnalyzing}
                  className="chess-btn-green flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition"
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
