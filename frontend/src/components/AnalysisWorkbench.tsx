import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Layers,
  BarChart3,
} from 'lucide-react';
import type { GameAnalysisReport, MoveEvaluation, MoveJudgment } from '../types/chess';

interface AnalysisWorkbenchProps {
  report: GameAnalysisReport;
  onClose?: () => void;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const AnalysisWorkbench: React.FC<AnalysisWorkbenchProps> = ({ report }) => {
  // Current ply index: -1 means initial starting position, 0 means after move 1, etc.
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const activeMoveRef = useRef<HTMLDivElement | null>(null);

  const totalMoves = report.moves.length;
  const currentMove: MoveEvaluation | null =
    currentPlyIndex >= 0 && currentPlyIndex < totalMoves ? report.moves[currentPlyIndex] : null;

  // Board FEN: initial fen if -1, otherwise fenAfter of the current move
  const currentFen = currentPlyIndex === -1 ? STARTING_FEN : (currentMove?.fenAfter || STARTING_FEN);

  // Auto-play timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlyIndex((prev) => {
          if (prev < totalMoves - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalMoves]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowUp') {
        goToStart();
      } else if (e.key === 'ArrowDown') {
        goToEnd();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlyIndex, totalMoves]);

  // Scroll active move into view in notation list
  useEffect(() => {
    if (activeMoveRef.current) {
      activeMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPlyIndex]);

  const goToStart = () => {
    setIsPlaying(false);
    setCurrentPlyIndex(-1);
  };

  const goToPrev = () => {
    setIsPlaying(false);
    setCurrentPlyIndex((prev) => Math.max(-1, prev - 1));
  };

  const goToNext = () => {
    setIsPlaying(false);
    setCurrentPlyIndex((prev) => Math.min(totalMoves - 1, prev + 1));
  };

  const goToEnd = () => {
    setIsPlaying(false);
    setCurrentPlyIndex(totalMoves - 1);
  };

  const toggleOrientation = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  // Convert bestMoveUci into an arrow object
  const getCustomArrows = () => {
    if (!currentMove) return [];

    const arrows: { startSquare: string; endSquare: string; color: string }[] = [];
    if (currentMove.bestMoveUci && currentMove.bestMoveUci.length >= 4) {
      const from = currentMove.bestMoveUci.substring(0, 2);
      const to = currentMove.bestMoveUci.substring(2, 4);
      arrows.push({
        startSquare: from,
        endSquare: to,
        color: 'rgba(16, 185, 129, 0.85)',
      });
    }
    return arrows;
  };

  // Eval bar height percentage (50% is even, 100% is full white, 0% is full black)
  const calculateWhitePercentage = () => {
    if (!currentMove) return 50;
    if (currentMove.mateIn != null) {
      return currentMove.mateIn > 0 ? 100 : 0;
    }
    const score = currentMove.evalScore ?? 0;
    // Map -6 to +6 pawns smoothly to 0% to 100%
    const clamped = Math.max(-6, Math.min(6, score));
    return 50 + (clamped / 6) * 45;
  };

  const whiteHeight = calculateWhitePercentage();

  const getJudgmentBadge = (judgment: MoveJudgment) => {
    switch (judgment) {
      case 'BOOK':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">📖 Book</span>;
      case 'BEST':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">★ Best</span>;
      case 'EXCELLENT':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">✓ Excellent</span>;
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">○ Good</span>;
      case 'INACCURACY':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">?! Inaccuracy</span>;
      case 'MISTAKE':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">? Mistake</span>;
      case 'BLUNDER':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">?? Blunder</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Accuracy & Game Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {report.result}
              </span>
              <h2 className="text-xl font-bold text-white">{report.opening}</h2>
            </div>
            <p className="text-xs text-slate-400">
              {report.whitePlayer} ({report.whiteRating || '?'}) vs {report.blackPlayer} ({report.blackRating || '?'})
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* White Accuracy */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">White Acc</div>
                <div className="text-lg font-bold text-white">{report.whiteAccuracy}%</div>
              </div>
            </div>

            {/* Black Accuracy */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-600" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Black Acc</div>
                <div className="text-lg font-bold text-white">{report.blackAccuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Move Quality Breakdown Table */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-emerald-400 font-semibold mb-1">★ Best Moves</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteBestMoves} <span className="text-slate-600">|</span> {report.blackBestMoves}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-blue-400 font-semibold mb-1">✓ Good Moves</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteGoodMoves} <span className="text-slate-600">|</span> {report.blackGoodMoves}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-amber-400 font-semibold mb-1">?! Inaccuracies</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteInaccuracies} <span className="text-slate-600">|</span> {report.blackInaccuracies}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-orange-400 font-semibold mb-1">? Mistakes</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteMistakes} <span className="text-slate-600">|</span> {report.blackMistakes}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-red-400 font-semibold mb-1">?? Blunders</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteBlunders} <span className="text-slate-600">|</span> {report.blackBlunders}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-indigo-400 font-semibold mb-1">ACPL (Centipawns)</div>
            <div className="text-sm font-bold text-slate-200">
              {report.whiteAcpl} <span className="text-slate-600">|</span> {report.blackAcpl}
            </div>
          </div>
        </div>
      </div>

      {/* Main Board & Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Eval Bar + Chessboard */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
          <div className="flex gap-4 w-full max-w-[540px]">
            {/* Vertical Eval Bar */}
            <div className="w-7 h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-end relative shadow-inner">
              <div
                className="w-full bg-slate-100 transition-all duration-300 ease-out"
                style={{ height: `${whiteHeight}%` }}
              />
              <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[10px] font-bold select-none pointer-events-none">
                <span className="text-slate-400 drop-shadow">
                  {currentMove?.playerColor === 'black' ? currentMove.evalText : ''}
                </span>
                <span className="text-slate-700 drop-shadow">
                  {currentMove?.playerColor === 'white' ? currentMove.evalText : ''}
                </span>
              </div>
            </div>

            {/* Chessboard Component with v5 options */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <Chessboard
                options={{
                  position: currentFen,
                  boardOrientation: boardOrientation,
                  arrows: getCustomArrows(),
                  darkSquareStyle: { backgroundColor: '#2f3b52' },
                  lightSquareStyle: { backgroundColor: '#77889e' },
                  animationDurationInMs: 250,
                  allowDragging: false,
                }}
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-[540px] mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={goToStart}
                disabled={currentPlyIndex <= -1}
                title="Start (Up Arrow)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToPrev}
                disabled={currentPlyIndex <= -1}
                title="Previous (Left Arrow)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                title="Auto Play (Space)"
                className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={goToNext}
                disabled={currentPlyIndex >= totalMoves - 1}
                title="Next (Right Arrow)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToEnd}
                disabled={currentPlyIndex >= totalMoves - 1}
                title="End (Down Arrow)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {currentPlyIndex === -1 ? '0' : currentPlyIndex + 1} / {totalMoves}
              </span>
              <button
                onClick={toggleOrientation}
                title="Flip Board"
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Flip
              </button>
            </div>
          </div>
        </div>

        {/* Right: Current Move Verdict & Move History Sheet */}
        <div className="lg:col-span-5 space-y-4">
          {/* Current Move Engine Verdict Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Engine Verdict
              </h3>
              {currentMove && getJudgmentBadge(currentMove.judgment)}
            </div>

            {currentMove ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-medium">Played Move:</span>
                    <div className="text-xl font-black text-white font-mono">
                      {currentMove.moveNumber}. {currentMove.playerColor === 'black' ? '...' : ''}
                      {currentMove.san}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase font-medium">Eval:</span>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      {currentMove.evalText}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Best Move Recommended:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentMove.bestMoveUci || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Win Chance Loss:</span>
                    <span className="font-mono font-semibold text-orange-400">
                      -{currentMove.winChanceLoss}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-slate-300 leading-relaxed">
                    {currentMove.explanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-6 text-center">
                Initial starting position. Use arrow keys or click a move to begin review.
              </div>
            )}
          </div>

          {/* Notation Sheet (Scrollable move history) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Move History
              </h3>
              <span className="text-[11px] text-slate-500">Click move to jump</span>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-1 font-mono text-xs">
              {Array.from({ length: Math.ceil(totalMoves / 2) }).map((_, moveIdx) => {
                const whitePly = moveIdx * 2;
                const blackPly = moveIdx * 2 + 1;
                const whiteEval = report.moves[whitePly];
                const blackEval = report.moves[blackPly];

                return (
                  <div
                    key={moveIdx}
                    className="grid grid-cols-12 items-center py-1 px-2 rounded hover:bg-slate-800/40 text-slate-300"
                  >
                    <span className="col-span-2 text-slate-500 font-medium">{moveIdx + 1}.</span>

                    {/* White Move */}
                    <div
                      ref={currentPlyIndex === whitePly ? activeMoveRef : null}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlyIndex(whitePly);
                      }}
                      className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded cursor-pointer transition ${
                        currentPlyIndex === whitePly
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'hover:bg-slate-800'
                      }`}
                    >
                      <span>{whiteEval?.san}</span>
                      {whiteEval && (
                        <span className="text-[10px] opacity-80">
                          {whiteEval.judgment === 'BLUNDER' && '🔴'}
                          {whiteEval.judgment === 'MISTAKE' && '🟠'}
                          {whiteEval.judgment === 'INACCURACY' && '🟡'}
                          {whiteEval.judgment === 'BEST' && '🟢'}
                        </span>
                      )}
                    </div>

                    {/* Black Move */}
                    {blackEval ? (
                      <div
                        ref={currentPlyIndex === blackPly ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentPlyIndex(blackPly);
                        }}
                        className={`col-span-5 flex items-center justify-between px-2 py-0.5 rounded cursor-pointer transition ${
                          currentPlyIndex === blackPly
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'hover:bg-slate-800'
                        }`}
                      >
                        <span>{blackEval.san}</span>
                        <span className="text-[10px] opacity-80">
                          {blackEval.judgment === 'BLUNDER' && '🔴'}
                          {blackEval.judgment === 'MISTAKE' && '🟠'}
                          {blackEval.judgment === 'INACCURACY' && '🟡'}
                          {blackEval.judgment === 'BEST' && '🟢'}
                        </span>
                      </div>
                    ) : (
                      <div className="col-span-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Advantage Evaluation Graph (SVG Area / Line Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Advantage Momentum Chart
            </h3>
          </div>
          <span className="text-xs text-slate-400">White (+) vs Black (-) Advantage Swings</span>
        </div>

        <div className="h-32 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${Math.max(100, totalMoves * 10)} 100`}>
            {/* Center zero line (draw) */}
            <line
              x1="0"
              y1="50"
              x2={Math.max(100, totalMoves * 10)}
              y2="50"
              stroke="#475569"
              strokeDasharray="3,3"
              strokeWidth="1"
            />

            {/* Eval line plot */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={report.moves
                .map((m, idx) => {
                  const x = (idx + 1) * 10;
                  const score = m.evalScore ?? 0;
                  // Clamp between -5 and +5 pawns
                  const clamped = Math.max(-5, Math.min(5, score));
                  // 50 is center, 10 is +5 white, 90 is -5 black
                  const y = 50 - (clamped / 5) * 40;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Clickable points */}
            {report.moves.map((m, idx) => {
              const x = (idx + 1) * 10;
              const score = m.evalScore ?? 0;
              const clamped = Math.max(-5, Math.min(5, score));
              const y = 50 - (clamped / 5) * 40;
              const isSelected = currentPlyIndex === idx;

              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={isSelected ? 5 : m.judgment === 'BLUNDER' ? 4 : 2}
                  fill={
                    isSelected
                      ? '#ffffff'
                      : m.judgment === 'BLUNDER'
                      ? '#ef4444'
                      : m.judgment === 'MISTAKE'
                      ? '#f97316'
                      : '#10b981'
                  }
                  stroke={isSelected ? '#10b981' : 'none'}
                  strokeWidth="2"
                  className="cursor-pointer hover:r-6 transition-all"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPlyIndex(idx);
                  }}
                >
                  <title>{`${m.moveNumber}. ${m.san}: ${m.evalText} (${m.judgment})`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
