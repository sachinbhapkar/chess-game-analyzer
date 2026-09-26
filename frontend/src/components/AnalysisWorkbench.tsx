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
  Flag,
  Award,
} from 'lucide-react';
import { ChessKing, JudgmentBadgeIcon } from './ChessIcons';
import type { GameAnalysisReport, MoveEvaluation, MoveJudgment } from '../types/chess';

interface AnalysisWorkbenchProps {
  report: GameAnalysisReport;
  onClose?: () => void;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const AnalysisWorkbench: React.FC<AnalysisWorkbenchProps> = ({ report }) => {
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const activeMoveRef = useRef<HTMLDivElement | null>(null);
  const notationContainerRef = useRef<HTMLDivElement | null>(null);

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
      }, 1250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalMoves]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowUp') {
        goToStart();
      } else if (e.key === 'ArrowDown') {
        goToEnd();
      } else if (e.key === ' ') {
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlyIndex, totalMoves]);

  // Auto scroll active move strictly inside notation sheet (prevents entire window/page jumping)
  useEffect(() => {
    const container = notationContainerRef.current;
    if (!container) return;

    if (currentPlyIndex === -1) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = activeMoveRef.current;
    if (element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // If the active move is above the visible container area
      if (elementRect.top < containerRect.top) {
        container.scrollBy({
          top: elementRect.top - containerRect.top - 8,
          behavior: 'smooth',
        });
      }
      // If the active move is below the visible container area
      else if (elementRect.bottom > containerRect.bottom) {
        container.scrollBy({
          top: elementRect.bottom - containerRect.bottom + 8,
          behavior: 'smooth',
        });
      }
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
        color: 'rgba(129, 182, 76, 0.9)', // Chess.com green arrow
      });
    }
    return arrows;
  };

  // Highlight squares for move made (from and to)
  const getCustomSquareStyles = () => {
    if (!currentMove) return {};
    const styles: Record<string, React.CSSProperties> = {};

    let tintColor = 'rgba(240, 193, 92, 0.4)'; // default yellow highlight
    if (currentMove.judgment === 'BLUNDER') {
      tintColor = 'rgba(202, 52, 49, 0.45)'; // red for blunder
    } else if (currentMove.judgment === 'MISTAKE') {
      tintColor = 'rgba(229, 143, 42, 0.45)'; // orange for mistake
    } else if (currentMove.judgment === 'BEST' || currentMove.judgment === 'BRILLIANT') {
      tintColor = 'rgba(129, 182, 76, 0.45)'; // green for best/brilliant
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

  const getVerdictDetails = (judgment: MoveJudgment) => {
    switch (judgment) {
      case 'BRILLIANT':
        return { label: 'Brilliant', color: 'text-[#1baca6]', bg: 'bg-[#1baca6]/15', border: 'border-[#1baca6]/40' };
      case 'GREAT':
        return { label: 'Great Move', color: 'text-[#5c8bb0]', bg: 'bg-[#5c8bb0]/15', border: 'border-[#5c8bb0]/40' };
      case 'BEST':
        return { label: 'Best Move', color: 'text-[#81b64c]', bg: 'bg-[#81b64c]/15', border: 'border-[#81b64c]/40' };
      case 'EXCELLENT':
        return { label: 'Excellent', color: 'text-[#96bc4b]', bg: 'bg-[#96bc4b]/15', border: 'border-[#96bc4b]/40' };
      case 'GOOD':
        return { label: 'Good', color: 'text-[#a3b18a]', bg: 'bg-[#a3b18a]/15', border: 'border-[#a3b18a]/40' };
      case 'BOOK':
        return { label: 'Book Move', color: 'text-[#d5a47d]', bg: 'bg-[#a88865]/15', border: 'border-[#a88865]/40' };
      case 'FORCED':
        return { label: 'Forced', color: 'text-slate-400', bg: 'bg-slate-700/20', border: 'border-slate-600/40' };
      case 'INACCURACY':
        return { label: 'Inaccuracy', color: 'text-[#f0c15c]', bg: 'bg-[#f0c15c]/15', border: 'border-[#f0c15c]/40' };
      case 'MISTAKE':
        return { label: 'Mistake', color: 'text-[#e58f2a]', bg: 'bg-[#e58f2a]/15', border: 'border-[#e58f2a]/40' };
      case 'MISSED_WIN':
        return { label: 'Missed Win', color: 'text-[#db4373]', bg: 'bg-[#db4373]/15', border: 'border-[#db4373]/40' };
      case 'BLUNDER':
        return { label: 'Blunder', color: 'text-[#ca3431]', bg: 'bg-[#ca3431]/20', border: 'border-[#ca3431]/50' };
    }
  };

  const badgePos = currentMove?.toSquare ? getBadgePosition(currentMove.toSquare) : null;

  // Coach summary text based on overall game stats
  const getCoachSummary = () => {
    if (report.whiteAccuracy >= 90) {
      return `Masterful performance! White played with ${report.whiteAccuracy}% accuracy, finding decisive engine moves.`;
    } else if (report.whiteBlunders === 0 && report.blackBlunders > 0) {
      return `Clinical game. White capitalized on Black's blunders without giving away chances.`;
    } else if (report.whiteBlunders > 0 && report.blackBlunders > 0) {
      return `A wild tactical slugfest with momentum swings on both sides!`;
    }
    return `Game completed. Review key moves and blunder opportunities below.`;
  };

  // Jump to next blunder or mistake
  const jumpToNextKeyMoment = () => {
    for (let i = currentPlyIndex + 1; i < totalMoves; i++) {
      const m = report.moves[i];
      if (
        m.judgment === 'BLUNDER' ||
        m.judgment === 'MISTAKE' ||
        m.judgment === 'MISSED_WIN' ||
        m.judgment === 'BRILLIANT'
      ) {
        setIsPlaying(false);
        setCurrentPlyIndex(i);
        return;
      }
    }
    // Loop to first blunder if at end
    for (let i = 0; i <= currentPlyIndex; i++) {
      const m = report.moves[i];
      if (
        m.judgment === 'BLUNDER' ||
        m.judgment === 'MISTAKE' ||
        m.judgment === 'MISSED_WIN' ||
        m.judgment === 'BRILLIANT'
      ) {
        setIsPlaying(false);
        setCurrentPlyIndex(i);
        return;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Game Review header */}
      <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c]">
            <Award size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Game Review</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e1c19] text-[#e69d00] border border-[#3d3b38]">
                {report.result}
              </span>
            </div>
            <p className="text-xs text-[#a09e9a] font-medium">{report.opening}</p>
          </div>
        </div>

        <button
          onClick={jumpToNextKeyMoment}
          className="chess-btn-green px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Flag size={14} />
          <span>Next Key Moment</span>
        </button>
      </div>

      {/* Main Chess.com Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Board + Player Banners + Eval Bar */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[540px] space-y-1.5">
            {/* Top Player Banner (Opponent) */}
            <div className="bg-[#262421] border border-[#3d3b38] px-3.5 py-2 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
                    boardOrientation === 'white' ? 'bg-[#1e1c19] border-[#4a4744]' : 'bg-white border-slate-300'
                  }`}
                />
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{boardOrientation === 'white' ? report.blackPlayer : report.whitePlayer}</span>
                  <span className="text-[#a09e9a] font-mono font-medium">
                    ({boardOrientation === 'white' ? report.blackRating || '?' : report.whiteRating || '?'})
                  </span>
                </div>
              </div>
              <div className="bg-[#1e1c19] px-2.5 py-1 rounded font-mono text-xs text-white font-bold border border-[#3d3b38]">
                3:00
              </div>
            </div>

            {/* Chessboard + Vertical Eval Bar */}
            <div className="flex gap-2.5 w-full">
              {/* Smooth Chess.com Evaluation Bar */}
              <div className="w-7 h-[480px] bg-[#1e1c19] rounded-md overflow-hidden border border-[#3d3b38] flex flex-col justify-end relative shadow-2xl">
                <div
                  className="w-full bg-[#f1f1f1] transition-all duration-300 ease-out"
                  style={{ height: `${whiteHeight}%` }}
                />
                <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[10px] font-black font-mono select-none pointer-events-none">
                  <span className="text-[#8b8987] drop-shadow">
                    {currentMove?.playerColor === 'black' ? currentMove.evalText : ''}
                  </span>
                  <span className="text-[#262421] drop-shadow">
                    {currentMove?.playerColor === 'white' ? currentMove.evalText : ''}
                  </span>
                </div>
              </div>

              {/* Tournament Chessboard Container with Absolute Badges */}
              <div className="flex-1 rounded-md overflow-hidden shadow-2xl border border-[#3d3b38] relative bg-[#262421]">
                <Chessboard
                  options={{
                    position: currentFen,
                    boardOrientation: boardOrientation,
                    arrows: getCustomArrows(),
                    squareStyles: getCustomSquareStyles(),
                    // Official Chess.com Tournament Green & Cream Board
                    darkSquareStyle: { backgroundColor: '#739552' },
                    lightSquareStyle: { backgroundColor: '#ebecd0' },
                    animationDurationInMs: 180,
                    allowDragging: false,
                  }}
                />

                {/* Floating Move Classification Badge Directly on the Square */}
                {currentMove && badgePos && (
                  <div
                    className="absolute pointer-events-none z-20 flex items-start justify-end p-1 transition-all duration-150 ease-out"
                    style={{
                      left: badgePos.left,
                      top: badgePos.top,
                      width: '12.5%',
                      height: '12.5%',
                    }}
                  >
                    <div className="transform -translate-y-1 translate-x-1 filter drop-shadow-xl scale-125 animate-in zoom-in-75 duration-150">
                      <JudgmentBadgeIcon type={currentMove.judgment} size={28} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Player Banner (User) */}
            <div className="bg-[#262421] border border-[#3d3b38] px-3.5 py-2 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
                    boardOrientation === 'white' ? 'bg-white border-slate-300' : 'bg-[#1e1c19] border-[#4a4744]'
                  }`}
                />
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{boardOrientation === 'white' ? report.whitePlayer : report.blackPlayer}</span>
                  <span className="text-[#a09e9a] font-mono font-medium">
                    ({boardOrientation === 'white' ? report.whiteRating || '?' : report.blackRating || '?'})
                  </span>
                </div>
              </div>
              <div className="bg-[#1e1c19] px-2.5 py-1 rounded font-mono text-xs text-white font-bold border border-[#3d3b38]">
                3:00
              </div>
            </div>

            {/* Tactile Navigation Buttons */}
            <div className="bg-[#262421] border border-[#3d3b38] p-2.5 rounded-xl flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToStart}
                  disabled={currentPlyIndex <= -1}
                  title="Start (Up Arrow)"
                  className="chess-btn-secondary p-2 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={goToPrev}
                  disabled={currentPlyIndex <= -1}
                  title="Previous Move (Left Arrow)"
                  className="chess-btn-secondary p-2 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentPlyIndex >= totalMoves - 1}
                  title="Next Move (Right Arrow)"
                  className="chess-btn-green px-5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                >
                  <span className="text-xs font-bold">Next</span>
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={goToEnd}
                  disabled={currentPlyIndex >= totalMoves - 1}
                  title="End (Down Arrow)"
                  className="chess-btn-secondary p-2 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  title="Auto Play (Space)"
                  className="chess-btn-secondary px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause' : 'Auto'}</span>
                </button>

                <button
                  onClick={toggleOrientation}
                  title="Flip Board"
                  className="chess-btn-secondary p-2 rounded-lg cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Game Review Sidebar (Chess.com layout) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Accuracy & Coach Overview Card */}
          <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-5 shadow-xl">
            {/* Accuracy Comparison */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#1e1c19] border border-[#3d3b38] p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#a09e9a] font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                  <span>White</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{report.whiteAccuracy}%</div>
                <div className="w-full bg-[#302e2b] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#81b64c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${report.whiteAccuracy}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#1e1c19] border border-[#3d3b38] p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#a09e9a] font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e1c19] border border-[#4a4744]" />
                  <span>Black</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{report.blackAccuracy}%</div>
                <div className="w-full bg-[#302e2b] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#81b64c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${report.blackAccuracy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coach Speech Bubble */}
            <div className="bg-[#1e1c19] border border-[#3d3b38] p-3.5 rounded-lg flex items-start gap-3 text-xs leading-relaxed text-[#c3c2c1]">
              <div className="w-8 h-8 rounded-full bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c] shrink-0 mt-0.5">
                <ChessKing size={16} />
              </div>
              <div>
                <span className="font-bold text-white block mb-0.5">Coach Review</span>
                <span>{getCoachSummary()}</span>
              </div>
            </div>
          </div>

          {/* Current Move Explanation Card */}
          <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8b8987] uppercase tracking-wider">
                Move Verdict
              </span>
              {currentMove && (
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type={currentMove.judgment} size={20} />
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
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
                <div className="flex items-baseline justify-between bg-[#1e1c19] p-3 rounded-lg border border-[#3d3b38]">
                  <div>
                    <span className="text-[10px] text-[#8b8987] uppercase font-bold">Move</span>
                    <div className="text-xl font-black text-white font-mono">
                      {currentMove.moveNumber}. {currentMove.playerColor === 'black' ? '...' : ''}
                      {currentMove.san}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8b8987] uppercase font-bold">Engine Eval</span>
                    <div className="text-lg font-black text-[#81b64c] font-mono">
                      {currentMove.evalText}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1c19] p-3 rounded-lg border border-[#3d3b38] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#c3c2c1]">
                    <span className="text-[#8b8987]">Best Alternative:</span>
                    <span className="font-mono font-bold text-[#81b64c] bg-[#81b64c]/10 px-2 py-0.5 rounded border border-[#81b64c]/20">
                      {currentMove.bestMoveUci || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#c3c2c1]">
                    <span className="text-[#8b8987]">Win Chance Loss:</span>
                    <span
                      className={`font-mono font-bold ${
                        currentMove.winChanceLoss > 15
                          ? 'text-[#ca3431]'
                          : currentMove.winChanceLoss > 5
                          ? 'text-[#f0c15c]'
                          : 'text-[#81b64c]'
                      }`}
                    >
                      -{currentMove.winChanceLoss}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#2d2b28] text-[#e2e1e0] leading-relaxed">
                    {currentMove.explanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#8b8987] py-6 text-center">
                Initial starting position. Click &quot;Next&quot; or press Right Arrow to review moves.
              </div>
            )}
          </div>

          {/* All Move Classification Counts (Iconic Chess.com Table) */}
          <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-[#8b8987] uppercase tracking-wider mb-3">
              Move Classification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BRILLIANT" size={16} />
                  <span className="text-[11px] font-bold text-[#1baca6]">Brilliant</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBrilliantMoves} | {report.blackBrilliantMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="GREAT" size={16} />
                  <span className="text-[11px] font-bold text-[#5c8bb0]">Great</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteGreatMoves} | {report.blackGreatMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BEST" size={16} />
                  <span className="text-[11px] font-bold text-[#81b64c]">Best</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBestMoves} | {report.blackBestMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="EXCELLENT" size={16} />
                  <span className="text-[11px] font-bold text-[#96bc4b]">Excellent</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteExcellentMoves} | {report.blackExcellentMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="GOOD" size={16} />
                  <span className="text-[11px] font-bold text-[#a3b18a]">Good</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteGoodMoves} | {report.blackGoodMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BOOK" size={16} />
                  <span className="text-[11px] font-bold text-[#d5a47d]">Book</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBookMoves} | {report.blackBookMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="INACCURACY" size={16} />
                  <span className="text-[11px] font-bold text-[#f0c15c]">Inaccuracy</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteInaccuracies} | {report.blackInaccuracies}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="MISTAKE" size={16} />
                  <span className="text-[11px] font-bold text-[#e58f2a]">Mistake</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteMistakes} | {report.blackMistakes}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="MISSED_WIN" size={16} />
                  <span className="text-[11px] font-bold text-[#db4373]">Missed Win</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteMissedWins} | {report.blackMissedWins}
                </span>
              </div>

              <div className="bg-[#1e1c19] p-2 rounded-lg border border-[#3d3b38] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BLUNDER" size={16} />
                  <span className="text-[11px] font-bold text-[#ca3431]">Blunder</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBlunders} | {report.blackBlunders}
                </span>
              </div>
            </div>
          </div>

          {/* Notation Sheet (Scrollable move history) */}
          <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-4 shadow-xl flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#3d3b38]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-[#81b64c]" />
                <span>Move Notation</span>
              </h3>
              <span className="text-[11px] text-[#8b8987]">Click move to jump</span>
            </div>

            <div
              ref={notationContainerRef}
              className="overflow-y-auto flex-1 pr-1 space-y-1 font-mono text-xs"
            >
              {Array.from({ length: Math.ceil(totalMoves / 2) }).map((_, moveIdx) => {
                const whitePly = moveIdx * 2;
                const blackPly = moveIdx * 2 + 1;
                const whiteEval = report.moves[whitePly];
                const blackEval = report.moves[blackPly];

                return (
                  <div
                    key={moveIdx}
                    className="grid grid-cols-12 items-center py-1 px-2 rounded hover:bg-[#302e2b] text-[#c3c2c1]"
                  >
                    <span className="col-span-2 text-[#8b8987] font-bold">{moveIdx + 1}.</span>

                    {/* White Move */}
                    <div
                      ref={currentPlyIndex === whitePly ? activeMoveRef : null}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlyIndex(whitePly);
                      }}
                      className={`col-span-5 flex items-center justify-between px-2.5 py-1 rounded cursor-pointer transition ${
                        currentPlyIndex === whitePly
                          ? 'bg-[#81b64c] text-white font-black shadow'
                          : 'hover:bg-[#3d3b38]'
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
                        className={`col-span-5 flex items-center justify-between px-2.5 py-1 rounded cursor-pointer transition ${
                          currentPlyIndex === blackPly
                            ? 'bg-[#81b64c] text-white font-black shadow'
                            : 'hover:bg-[#3d3b38]'
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

      {/* Advantage Momentum Evaluation Graph */}
      <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#81b64c]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Advantage Momentum Graph
            </h3>
          </div>
          <span className="text-xs text-[#a09e9a]">White (+) vs Black (-) Advantage Swings</span>
        </div>

        <div className="h-32 w-full relative bg-[#1e1c19] rounded-lg p-2 border border-[#3d3b38]">
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
              stroke="#4a4744"
              strokeDasharray="3,3"
              strokeWidth="1"
            />

            {/* Polyline Advantage Curve */}
            <polyline
              fill="none"
              stroke="#81b64c"
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
                  r={isSelected ? 6 : m.judgment === 'BLUNDER' ? 4.5 : 2.5}
                  fill={
                    isSelected
                      ? '#ffffff'
                      : m.judgment === 'BLUNDER'
                      ? '#ca3431'
                      : m.judgment === 'MISTAKE'
                      ? '#e58f2a'
                      : m.judgment === 'BRILLIANT'
                      ? '#1baca6'
                      : '#81b64c'
                  }
                  stroke={isSelected ? '#81b64c' : 'none'}
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
