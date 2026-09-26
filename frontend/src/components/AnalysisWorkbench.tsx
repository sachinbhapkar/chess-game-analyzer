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
  BarChart3,
  Layers,
} from 'lucide-react';
import { ChessKing, ChessKnight, JudgmentBadgeIcon } from './ChessIcons';
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
      }, 1300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalMoves]);

  // Keyboard navigation
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

  // Auto scroll active move in notation sheet
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

  // Convert bestMoveUci into an engine recommendation arrow
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

  // Highlight squares for move made (from and to)
  const getCustomSquareStyles = () => {
    if (!currentMove) return {};
    const styles: Record<string, React.CSSProperties> = {};

    let tintColor = 'rgba(245, 158, 11, 0.28)'; // default gold
    if (currentMove.judgment === 'BLUNDER') {
      tintColor = 'rgba(239, 68, 68, 0.35)'; // red for blunder
    } else if (currentMove.judgment === 'MISTAKE') {
      tintColor = 'rgba(249, 115, 22, 0.32)'; // orange for mistake
    } else if (currentMove.judgment === 'BEST' || currentMove.judgment === 'BRILLIANT') {
      tintColor = 'rgba(16, 185, 129, 0.32)'; // emerald for best/brilliant
    }

    if (currentMove.fromSquare) {
      styles[currentMove.fromSquare] = { backgroundColor: tintColor };
    }
    if (currentMove.toSquare) {
      styles[currentMove.toSquare] = { backgroundColor: tintColor };
    }
    return styles;
  };

  // Calculate destination square coordinates for the floating badge on the chessboard
  const getBadgePosition = (sq: string) => {
    if (!sq || sq.length < 2) return null;
    const file = sq[0].toLowerCase();
    const rank = parseInt(sq[1], 10);

    let col = file.charCodeAt(0) - 97; // 0 to 7
    let row = 8 - rank; // 0 to 7

    if (boardOrientation === 'black') {
      col = 7 - col;
      row = rank - 1;
    }

    return {
      left: `${col * 12.5}%`,
      top: `${row * 12.5}%`,
    };
  };

  // Evaluation bar height (50% is equal, 100% is white crushing, 0% is black crushing)
  const calculateWhitePercentage = () => {
    if (!currentMove) return 50;
    if (currentMove.mateIn != null) {
      return currentMove.mateIn > 0 ? 100 : 0;
    }
    const score = currentMove.evalScore ?? 0;
    const clamped = Math.max(-6, Math.min(6, score));
    return 50 + (clamped / 6) * 45;
  };

  const whiteHeight = calculateWhitePercentage();

  // Full judgment label text & color
  const getVerdictDetails = (judgment: MoveJudgment) => {
    switch (judgment) {
      case 'BRILLIANT':
        return { label: 'Brilliant', color: 'text-[#1baca6]', bg: 'bg-[#1baca6]/15', border: 'border-[#1baca6]/30' };
      case 'GREAT':
        return { label: 'Great Move', color: 'text-[#5c8bb0]', bg: 'bg-[#5c8bb0]/15', border: 'border-[#5c8bb0]/30' };
      case 'BEST':
        return { label: 'Best Move', color: 'text-[#81b64c]', bg: 'bg-[#81b64c]/15', border: 'border-[#81b64c]/30' };
      case 'EXCELLENT':
        return { label: 'Excellent', color: 'text-[#96bc4b]', bg: 'bg-[#96bc4b]/15', border: 'border-[#96bc4b]/30' };
      case 'GOOD':
        return { label: 'Good', color: 'text-[#a3b18a]', bg: 'bg-[#a3b18a]/15', border: 'border-[#a3b18a]/30' };
      case 'BOOK':
        return { label: 'Book Move', color: 'text-[#d5a47d]', bg: 'bg-[#a88865]/15', border: 'border-[#a88865]/30' };
      case 'FORCED':
        return { label: 'Forced', color: 'text-slate-400', bg: 'bg-slate-700/20', border: 'border-slate-600/30' };
      case 'INACCURACY':
        return { label: 'Inaccuracy', color: 'text-[#f0c15c]', bg: 'bg-[#f0c15c]/15', border: 'border-[#f0c15c]/30' };
      case 'MISTAKE':
        return { label: 'Mistake', color: 'text-[#e58f2a]', bg: 'bg-[#e58f2a]/15', border: 'border-[#e58f2a]/30' };
      case 'MISSED_WIN':
        return { label: 'Missed Win', color: 'text-[#db4373]', bg: 'bg-[#db4373]/15', border: 'border-[#db4373]/30' };
      case 'BLUNDER':
        return { label: 'Blunder', color: 'text-[#ca3431]', bg: 'bg-[#ca3431]/20', border: 'border-[#ca3431]/40' };
    }
  };

  const badgePos = currentMove?.toSquare ? getBadgePosition(currentMove.toSquare) : null;

  return (
    <div className="space-y-6">
      {/* Accuracy & Game Header Summary */}
      <div className="bg-[#15171f] border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                {report.result}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{report.opening}</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300 inline-block" />
                <span className="font-semibold text-slate-200">{report.whitePlayer}</span>
                <span className="font-mono text-slate-400">({report.whiteRating || '?'})</span>
              </div>
              <span className="text-slate-600">vs</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600 inline-block" />
                <span className="font-semibold text-slate-200">{report.blackPlayer}</span>
                <span className="font-mono text-slate-400">({report.blackRating || '?'})</span>
              </div>
            </div>
          </div>

          {/* Accuracy Score Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#0d0e12] px-5 py-3 rounded-xl border border-white/10 shadow-inner">
              <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-400 shadow" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">White Acc</div>
                <div className="text-xl font-black text-white font-mono">{report.whiteAccuracy}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#0d0e12] px-5 py-3 rounded-xl border border-white/10 shadow-inner">
              <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 shadow" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Black Acc</div>
                <div className="text-xl font-black text-white font-mono">{report.blackAccuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Move Classification Counts Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2 mt-5 text-center text-xs">
          {/* Brilliant */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="BRILLIANT" size={14} />
              <span className="text-[11px] font-bold text-[#1baca6]">Brilliant</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteBrilliantMoves} <span className="text-slate-600">|</span> {report.blackBrilliantMoves}
            </div>
          </div>

          {/* Great */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="GREAT" size={14} />
              <span className="text-[11px] font-bold text-[#5c8bb0]">Great</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteGreatMoves} <span className="text-slate-600">|</span> {report.blackGreatMoves}
            </div>
          </div>

          {/* Best */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="BEST" size={14} />
              <span className="text-[11px] font-bold text-[#81b64c]">Best</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteBestMoves} <span className="text-slate-600">|</span> {report.blackBestMoves}
            </div>
          </div>

          {/* Excellent */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="EXCELLENT" size={14} />
              <span className="text-[11px] font-bold text-[#96bc4b]">Excellent</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteExcellentMoves} <span className="text-slate-600">|</span> {report.blackExcellentMoves}
            </div>
          </div>

          {/* Good */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="GOOD" size={14} />
              <span className="text-[11px] font-bold text-[#a3b18a]">Good</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteGoodMoves} <span className="text-slate-600">|</span> {report.blackGoodMoves}
            </div>
          </div>

          {/* Book */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="BOOK" size={14} />
              <span className="text-[11px] font-bold text-[#d5a47d]">Book</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteBookMoves} <span className="text-slate-600">|</span> {report.blackBookMoves}
            </div>
          </div>

          {/* Inaccuracy */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="INACCURACY" size={14} />
              <span className="text-[11px] font-bold text-[#f0c15c]">Inaccuracy</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteInaccuracies} <span className="text-slate-600">|</span> {report.blackInaccuracies}
            </div>
          </div>

          {/* Mistake */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="MISTAKE" size={14} />
              <span className="text-[11px] font-bold text-[#e58f2a]">Mistake</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteMistakes} <span className="text-slate-600">|</span> {report.blackMistakes}
            </div>
          </div>

          {/* Missed Win */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="MISSED_WIN" size={14} />
              <span className="text-[11px] font-bold text-[#db4373]">Missed Win</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteMissedWins} <span className="text-slate-600">|</span> {report.blackMissedWins}
            </div>
          </div>

          {/* Blunder */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <JudgmentBadgeIcon type="BLUNDER" size={14} />
              <span className="text-[11px] font-bold text-[#ca3431]">Blunder</span>
            </div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteBlunders} <span className="text-slate-600">|</span> {report.blackBlunders}
            </div>
          </div>

          {/* ACPL */}
          <div className="bg-[#0e1015] p-2 rounded-xl border border-white/5 col-span-3 sm:col-span-2 lg:col-span-1">
            <div className="text-[11px] font-bold text-indigo-400 mb-1">ACPL</div>
            <div className="font-mono font-bold text-slate-200 text-xs">
              {report.whiteAcpl} <span className="text-slate-600">|</span> {report.blackAcpl}
            </div>
          </div>
        </div>
      </div>

      {/* Main Board & Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Eval Bar + Chessboard with On-Board Floating Badges */}
        <div className="lg:col-span-7 bg-[#15171f] border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col items-center">
          <div className="flex gap-3.5 w-full max-w-[540px]">
            {/* Dynamic Sleek Evaluation Bar */}
            <div className="w-8 h-[480px] bg-[#0c0d11] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-end relative shadow-2xl">
              <div
                className="w-full bg-[#f1f1f1] transition-all duration-300 ease-out"
                style={{ height: `${whiteHeight}%` }}
              />
              <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[10px] font-black font-mono select-none pointer-events-none">
                <span className="text-slate-400 drop-shadow-md">
                  {currentMove?.playerColor === 'black' ? currentMove.evalText : ''}
                </span>
                <span className="text-slate-800 drop-shadow-md">
                  {currentMove?.playerColor === 'white' ? currentMove.evalText : ''}
                </span>
              </div>
            </div>

            {/* Chessboard Container with Absolute Floating Badges */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
              <Chessboard
                options={{
                  position: currentFen,
                  boardOrientation: boardOrientation,
                  arrows: getCustomArrows(),
                  squareStyles: getCustomSquareStyles(),
                  // Authentic Tournament Green & Cream Theme
                  darkSquareStyle: { backgroundColor: '#739552' },
                  lightSquareStyle: { backgroundColor: '#ebecd0' },
                  animationDurationInMs: 200,
                  allowDragging: false,
                }}
              />

              {/* Floating Move Classification Badge Directly On Destination Square */}
              {currentMove && badgePos && (
                <div
                  className="absolute pointer-events-none z-20 flex items-start justify-end p-1 transition-all duration-200 ease-out"
                  style={{
                    left: badgePos.left,
                    top: badgePos.top,
                    width: '12.5%',
                    height: '12.5%',
                  }}
                >
                  <div className="transform -translate-y-1 translate-x-1 filter drop-shadow-lg scale-110 animate-in zoom-in-50 duration-200">
                    <JudgmentBadgeIcon type={currentMove.judgment} size={26} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-[540px] mt-4 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={goToStart}
                disabled={currentPlyIndex <= -1}
                title="Start (Up Arrow)"
                className="p-2 rounded-xl bg-[#0d0e12] hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-white/5 transition cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToPrev}
                disabled={currentPlyIndex <= -1}
                title="Previous (Left Arrow)"
                className="p-2 rounded-xl bg-[#0d0e12] hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-white/5 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                title="Auto Play (Space)"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentPlyIndex >= totalMoves - 1}
                title="Next (Right Arrow)"
                className="p-2 rounded-xl bg-[#0d0e12] hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-white/5 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToEnd}
                disabled={currentPlyIndex >= totalMoves - 1}
                title="End (Down Arrow)"
                className="p-2 rounded-xl bg-[#0d0e12] hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-white/5 transition cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono font-medium">
                {currentPlyIndex === -1 ? 'Start' : `${currentPlyIndex + 1} / ${totalMoves}`}
              </span>
              <button
                onClick={toggleOrientation}
                title="Flip Board"
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-[#0d0e12] hover:bg-slate-800 text-slate-300 border border-white/10 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Flip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Engine Verdict Card & Scrollable Notation Sheet */}
        <div className="lg:col-span-5 space-y-4">
          {/* Current Move Engine Verdict Card */}
          <div className="bg-[#15171f] border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ChessKing size={16} className="text-amber-400" />
                <span>Engine Move Review</span>
              </h3>
              {currentMove && (
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type={currentMove.judgment} size={20} />
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      getVerdictDetails(currentMove.judgment).bg
                    } ${getVerdictDetails(currentMove.judgment).color} ${
                      getVerdictDetails(currentMove.judgment).border
                    }`}
                  >
                    {getVerdictDetails(currentMove.judgment).label}
                  </span>
                </div>
              )}
            </div>

            {currentMove ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between bg-[#0d0e12] p-4 rounded-xl border border-white/10 shadow-inner">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Played Move
                    </span>
                    <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                      <span>
                        {currentMove.moveNumber}. {currentMove.playerColor === 'black' ? '...' : ''}
                        {currentMove.san}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Eval
                    </span>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      {currentMove.evalText}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d0e12]/80 p-3.5 rounded-xl border border-white/5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Stockfish Best Move:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {currentMove.bestMoveUci || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Win Chance Loss:</span>
                    <span
                      className={`font-mono font-bold ${
                        currentMove.winChanceLoss > 15
                          ? 'text-red-400'
                          : currentMove.winChanceLoss > 5
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      -{currentMove.winChanceLoss}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-slate-300 leading-relaxed font-sans">
                    {currentMove.explanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
                <ChessKnight size={28} className="text-slate-600" />
                <span>Starting position. Use arrow keys or click any move in the list to begin review.</span>
              </div>
            )}
          </div>

          {/* Move History Sheet */}
          <div className="bg-[#15171f] border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Move Notation Sheet</span>
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
                    className="grid grid-cols-12 items-center py-1 px-2 rounded-lg hover:bg-white/[0.03] text-slate-300"
                  >
                    <span className="col-span-2 text-slate-500 font-bold">{moveIdx + 1}.</span>

                    {/* White Move */}
                    <div
                      ref={currentPlyIndex === whitePly ? activeMoveRef : null}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlyIndex(whitePly);
                      }}
                      className={`col-span-5 flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition ${
                        currentPlyIndex === whitePly
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span>{whiteEval?.san}</span>
                      {whiteEval && <JudgmentBadgeIcon type={whiteEval.judgment} size={15} />}
                    </div>

                    {/* Black Move */}
                    {blackEval ? (
                      <div
                        ref={currentPlyIndex === blackPly ? activeMoveRef : null}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentPlyIndex(blackPly);
                        }}
                        className={`col-span-5 flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition ${
                          currentPlyIndex === blackPly
                            ? 'bg-emerald-600 text-white font-bold shadow-md'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span>{blackEval.san}</span>
                        <JudgmentBadgeIcon type={blackEval.judgment} size={15} />
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

      {/* Advantage Momentum Chart */}
      <div className="bg-[#15171f] border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
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
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${Math.max(100, totalMoves * 10)} 100`}
          >
            {/* Center zero line (even position) */}
            <line
              x1="0"
              y1="50"
              x2={Math.max(100, totalMoves * 10)}
              y2="50"
              stroke="#475569"
              strokeDasharray="3,3"
              strokeWidth="1"
            />

            {/* Polyline Advantage Curve */}
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
                  const clamped = Math.max(-5, Math.min(5, score));
                  const y = 50 - (clamped / 5) * 40;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Clickable move nodes on the momentum curve */}
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
                  r={isSelected ? 6 : m.judgment === 'BLUNDER' ? 4.5 : 2}
                  fill={
                    isSelected
                      ? '#ffffff'
                      : m.judgment === 'BLUNDER'
                      ? '#ca3431'
                      : m.judgment === 'MISTAKE'
                      ? '#e58f2a'
                      : m.judgment === 'BRILLIANT'
                      ? '#1baca6'
                      : '#10b981'
                  }
                  stroke={isSelected ? '#10b981' : 'none'}
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-125 transition-transform"
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
