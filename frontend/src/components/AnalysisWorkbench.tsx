import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
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
  Cpu,
  Sparkles,
  Eye,
  Check,
} from 'lucide-react';
import { JudgmentBadgeIcon } from './ChessIcons';
import { useTheme } from '../context/ThemeContext';
import type { GameAnalysisReport, MoveEvaluation, MoveJudgment } from '../types/chess';

interface AnalysisWorkbenchProps {
  report: GameAnalysisReport;
  onClose?: () => void;
  onOpenEngineModal?: () => void;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const AnalysisWorkbench: React.FC<AnalysisWorkbenchProps> = ({ report, onOpenEngineModal }) => {
  const { theme } = useTheme();
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'played' | 'best' | 'best_preview'>('played');
  const activeMoveRef = useRef<HTMLDivElement | null>(null);
  const notationContainerRef = useRef<HTMLDivElement | null>(null);

  const totalMoves = report.moves.length;
  const currentMove: MoveEvaluation | null =
    currentPlyIndex >= 0 && currentPlyIndex < totalMoves ? report.moves[currentPlyIndex] : null;

  // Reset view mode to 'played' whenever ply index changes
  useEffect(() => {
    setViewMode('played');
  }, [currentPlyIndex]);

  // Only blunders, mistakes, inaccuracies, and missed wins should have suggestion arrows on the board
  const isErrorMove = (judgment?: MoveJudgment): boolean => {
    return (
      judgment === 'BLUNDER' ||
      judgment === 'MISTAKE' ||
      judgment === 'INACCURACY' ||
      judgment === 'MISSED_WIN'
    );
  };

  // Compute best move in standard algebraic notation (SAN) and resulting board state
  const bestMoveInfo = useMemo(() => {
    if (!currentMove || !currentMove.bestMoveUci || currentMove.bestMoveUci.length < 4) {
      return null;
    }
    try {
      const chess = new Chess(currentMove.fenBefore);
      const from = currentMove.bestMoveUci.substring(0, 2);
      const to = currentMove.bestMoveUci.substring(2, 4);
      const promotion = currentMove.bestMoveUci.length > 4 ? currentMove.bestMoveUci[4] : undefined;
      const res = chess.move({ from, to, promotion });
      if (!res) return null;
      return {
        san: res.san,
        from,
        to,
        piece: res.piece,
        fenAfterBest: chess.fen(),
        captured: res.captured,
      };
    } catch {
      return null;
    }
  }, [currentMove]);

  // True only when the move was an error and a better move exists
  const hasSuggestion = Boolean(currentMove && isErrorMove(currentMove.judgment) && bestMoveInfo);

  // In 'best' mode, board reverts to fenBefore so user sees the glowing arrow of what should have been played.
  // In 'best_preview' mode, board shows fenAfterBest so user sees the resulting position.
  const currentFen =
    currentPlyIndex === -1
      ? STARTING_FEN
      : viewMode === 'best'
      ? (currentMove?.fenBefore || STARTING_FEN)
      : viewMode === 'best_preview'
      ? (bestMoveInfo?.fenAfterBest || currentMove?.fenAfter || STARTING_FEN)
      : (currentMove?.fenAfter || STARTING_FEN);

  // Auto-play timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setViewMode('played');
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
    setViewMode('played');
    setCurrentPlyIndex(-1);
  };

  const goToPrev = () => {
    setIsPlaying(false);
    setViewMode('played');
    setCurrentPlyIndex((prev) => Math.max(-1, prev - 1));
  };

  const goToNext = () => {
    setIsPlaying(false);
    setViewMode('played');
    setCurrentPlyIndex((prev) => Math.min(totalMoves - 1, prev + 1));
  };

  const goToEnd = () => {
    setIsPlaying(false);
    setViewMode('played');
    setCurrentPlyIndex(totalMoves - 1);
  };

  const toggleOrientation = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  // Convert bestMoveUci or played move into board recommendation arrows
  const getCustomArrows = () => {
    if (!currentMove) return [];

    const arrows: { startSquare: string; endSquare: string; color: string }[] = [];

    if (viewMode === 'best') {
      // In Best Move mode, show ONLY the glowing green engine recommendation arrow
      if (bestMoveInfo) {
        arrows.push({
          startSquare: bestMoveInfo.from,
          endSquare: bestMoveInfo.to,
          color: 'rgba(129, 182, 76, 0.95)', // Chess.com green arrow
        });
      }
      return arrows;
    }

    if (viewMode === 'best_preview') {
      // In Preview mode, the piece is already placed on bestMoveInfo.to, so no arrow needed
      return [];
    }

    // In Played mode:
    // 1. Draw the played move arrow
    if (currentMove.fromSquare && currentMove.toSquare) {
      let playedColor = 'rgba(148, 163, 184, 0.7)'; // Default slate
      if (currentMove.judgment === 'BEST') {
        playedColor = 'rgba(129, 182, 76, 0.9)'; // Green
      } else if (currentMove.judgment === 'BRILLIANT') {
        playedColor = 'rgba(27, 172, 166, 0.95)'; // Cyan
      } else if (currentMove.judgment === 'GREAT') {
        playedColor = 'rgba(59, 130, 246, 0.9)'; // Blue
      } else if (currentMove.judgment === 'EXCELLENT' || currentMove.judgment === 'GOOD') {
        playedColor = 'rgba(150, 188, 75, 0.85)'; // Olive green
      } else if (currentMove.judgment === 'BOOK') {
        playedColor = 'rgba(168, 136, 101, 0.85)'; // Book tan
      } else if (currentMove.judgment === 'BLUNDER') {
        playedColor = 'rgba(220, 38, 38, 0.85)'; // Red arrow for blunder
      } else if (
        currentMove.judgment === 'MISTAKE' ||
        currentMove.judgment === 'INACCURACY' ||
        currentMove.judgment === 'MISSED_WIN'
      ) {
        playedColor = 'rgba(234, 88, 12, 0.85)'; // Orange arrow for mistake
      }

      arrows.push({
        startSquare: currentMove.fromSquare,
        endSquare: currentMove.toSquare,
        color: playedColor,
      });
    }

    // 2. SUGGESTED MOVE ARROW:
    // ONLY drawn when the move is an ERROR (Blunder, Mistake, Inaccuracy, Missed Win).
    // On all normal moves (Book, Best, Good, etc.), it immediately DISAPPEARS!
    if (hasSuggestion && bestMoveInfo) {
      arrows.push({
        startSquare: bestMoveInfo.from,
        endSquare: bestMoveInfo.to,
        color: 'rgba(129, 182, 76, 0.95)', // Chess.com engine glowing green arrow
      });
    }

    return arrows;
  };

  // Highlight squares for move made (from and to) and suggested move destination
  const getCustomSquareStyles = () => {
    if (!currentMove) return {};
    const styles: Record<string, React.CSSProperties> = {};

    if (viewMode === 'best' && bestMoveInfo) {
      styles[bestMoveInfo.from] = { backgroundColor: 'rgba(129, 182, 76, 0.35)' };
      styles[bestMoveInfo.to] = {
        backgroundColor: 'rgba(129, 182, 76, 0.55)',
        boxShadow: 'inset 0 0 0 2px rgba(129, 182, 76, 0.95)',
      };
      return styles;
    }

    if (viewMode === 'best_preview' && bestMoveInfo) {
      styles[bestMoveInfo.from] = { backgroundColor: 'rgba(129, 182, 76, 0.25)' };
      styles[bestMoveInfo.to] = {
        backgroundColor: 'rgba(129, 182, 76, 0.5)',
        boxShadow: 'inset 0 0 0 2px rgba(129, 182, 76, 0.95)',
      };
      return styles;
    }

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

    // DIRECTLY HIGHLIGHT SUGGESTED MOVE DESTINATION ONLY FOR ERRORS
    if (hasSuggestion && bestMoveInfo) {
      styles[bestMoveInfo.to] = {
        backgroundColor: 'rgba(129, 182, 76, 0.35)',
        boxShadow: 'inset 0 0 0 2px rgba(129, 182, 76, 0.9)',
      };
      if (bestMoveInfo.from !== currentMove.fromSquare && bestMoveInfo.from !== currentMove.toSquare) {
        styles[bestMoveInfo.from] = {
          backgroundColor: 'rgba(129, 182, 76, 0.2)',
        };
      }
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
    if (viewMode === 'best' && currentMove.bestEvalScore != null) {
      if (currentMove.bestMateIn != null) {
        return currentMove.bestMateIn > 0 ? 100 : 0;
      }
      const score = currentMove.bestEvalScore;
      const clamped = Math.max(-6, Math.min(6, score));
      return 50 + (clamped / 6) * 45;
    }
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

  const getVerdictGlow = (judgment?: MoveJudgment) => {
    if (!judgment) return 'border-[#3d3b38]';
    switch (judgment) {
      case 'BRILLIANT':
        return 'border-[#1baca6] shadow-[0_0_25px_rgba(27,172,166,0.35)]';
      case 'GREAT':
        return 'border-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.3)]';
      case 'BEST':
        return 'border-[#81b64c] shadow-[0_0_20px_rgba(129,182,76,0.3)]';
      case 'EXCELLENT':
      case 'GOOD':
        return 'border-[#96bc4b]/60 shadow-[0_0_15px_rgba(150,188,75,0.2)]';
      case 'BOOK':
        return 'border-[#a88865] shadow-[0_0_15px_rgba(168,136,101,0.25)]';
      case 'INACCURACY':
        return 'border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      case 'MISTAKE':
        return 'border-[#ea580c] shadow-[0_0_25px_rgba(234,88,12,0.35)]';
      case 'MISSED_WIN':
        return 'border-[#db2777] shadow-[0_0_25px_rgba(219,39,119,0.35)]';
      case 'BLUNDER':
        return 'border-[#dc2626] shadow-[0_0_30px_rgba(220,38,38,0.45)]';
      default:
        return 'border-[#3d3b38]';
    }
  };

  const badgeTargetSquare =
    viewMode === 'best' || viewMode === 'best_preview'
      ? bestMoveInfo?.to
      : currentMove?.toSquare;

  const badgePos = badgeTargetSquare ? getBadgePosition(badgeTargetSquare) : null;
  const bestBadgePos = hasSuggestion && bestMoveInfo ? getBadgePosition(bestMoveInfo.to) : null;

  const activeBadgeType: MoveJudgment =
    viewMode === 'best' || viewMode === 'best_preview'
      ? 'BEST'
      : (currentMove?.judgment || 'BOOK');

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
        setViewMode('played');
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
        setViewMode('played');
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
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Game Review</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e1c19] text-[#e69d00] border border-[#3d3b38]">
                {report.result}
              </span>
              {onOpenEngineModal ? (
                <button
                  onClick={onOpenEngineModal}
                  title="Engine used for evaluation (click to change)"
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 hover:bg-[#81b64c]/25 transition flex items-center gap-1 cursor-pointer"
                >
                  <Cpu size={12} />
                  <span>{report.engineName || 'Stockfish 19'}</span>
                  <span className="text-[#a09e9a] font-normal hidden sm:inline">({report.engineRating || '3550+'})</span>
                </button>
              ) : (
                <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 flex items-center gap-1">
                  <Cpu size={12} />
                  <span>{report.engineName || 'Stockfish 19'}</span>
                </div>
              )}
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

            {/* Best Move State Indicator Banner */}
            {viewMode === 'best' && bestMoveInfo && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles size={14} />
                  <span>
                    Board shows pre-mistake position with Suggested Move: <strong className="text-white font-mono text-sm">{bestMoveInfo.san}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode('best_preview')}
                    className="px-2.5 py-1 rounded-lg bg-[#81b64c] text-white font-bold hover:bg-[#96bc4b] transition cursor-pointer text-[11px] keep-white shadow-sm flex items-center gap-1"
                  >
                    <span>Play Move</span>
                    <Play size={10} className="fill-white" />
                  </button>
                  <button
                    onClick={() => setViewMode('played')}
                    className="px-2.5 py-1 rounded-lg bg-[#1e1c19] text-[#a09e9a] hover:text-white border border-[#3d3b38] hover:border-slate-400 transition cursor-pointer text-[11px]"
                  >
                    Show Played ↩
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'best_preview' && bestMoveInfo && (
              <div className="bg-[#81b64c]/20 border border-[#81b64c]/50 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150 shadow-md">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Check size={14} className="text-[#81b64c]" />
                  <span>
                    Position after Suggested Move: <strong className="text-[#81b64c] font-mono text-sm">{bestMoveInfo.san}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode('best')}
                    className="px-2.5 py-1 rounded-lg bg-[#1e1c19] text-white border border-[#3d3b38] hover:bg-[#2c2a27] transition cursor-pointer text-[11px]"
                  >
                    Show Arrow ◀
                  </button>
                  <button
                    onClick={() => setViewMode('played')}
                    className="px-2.5 py-1 rounded-lg bg-[#1e1c19] text-[#a09e9a] hover:text-white border border-[#3d3b38] transition cursor-pointer text-[11px]"
                  >
                    Show Played ↩
                  </button>
                </div>
              </div>
            )}

            {/* Chessboard + Vertical Eval Bar */}
            <div className="flex gap-2.5 w-full">
              {/* Smooth Chess.com Evaluation Bar */}
              <div className="w-7 h-[480px] bg-[#1e1c19] eval-bar-track rounded-md overflow-hidden border border-[#3d3b38] flex flex-col justify-end relative shadow-2xl">
                <div
                  className="w-full bg-[#f1f1f1] transition-all duration-300 ease-out"
                  style={{ height: `${whiteHeight}%` }}
                />
                <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[10px] font-black font-mono select-none pointer-events-none">
                  <span className="text-[#a09e9a] drop-shadow keep-eval-black">
                    {currentMove?.playerColor === 'black' ? currentMove.evalText : ''}
                  </span>
                  <span className="text-[#262421] drop-shadow keep-eval-white">
                    {currentMove?.playerColor === 'white' ? currentMove.evalText : ''}
                  </span>
                </div>
              </div>

              {/* Tournament Chessboard Container with Absolute Badges */}
              <div className="flex-1 rounded-md overflow-hidden shadow-2xl border border-[#3d3b38] relative bg-[#262421]">
                <Chessboard
                  options={{
                    id: `board-ply-${currentPlyIndex}-${viewMode}`,
                    position: currentFen,
                    boardOrientation: boardOrientation,
                    arrows: getCustomArrows(),
                    squareStyles: getCustomSquareStyles(),
                    // Theme-adaptive Board Colors: Dark Slate for OLED Black, Tournament Green for Dark & White
                    darkSquareStyle: { backgroundColor: theme === 'black' ? '#383e45' : '#739552' },
                    lightSquareStyle: { backgroundColor: theme === 'black' ? '#8a939e' : '#ebecd0' },
                    animationDurationInMs: 180,
                    allowDragging: false,
                    allowDrawingArrows: false,
                    clearArrowsOnPositionChange: true,
                  }}
                />

                {/* Floating Move Classification Badge Directly on the Square */}
                {badgePos && (
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
                      <JudgmentBadgeIcon type={activeBadgeType} size={28} />
                    </div>
                  </div>
                )}

                {/* Floating BEST Move Badge Directly on the Suggested Square on the Board (Error moves only) */}
                {bestBadgePos &&
                  viewMode === 'played' &&
                  hasSuggestion &&
                  bestMoveInfo &&
                  currentMove &&
                  bestMoveInfo.to !== currentMove.toSquare && (
                    <div
                      className="absolute pointer-events-none z-20 flex items-start justify-end p-1 transition-all duration-150 ease-out"
                      style={{
                        left: bestBadgePos.left,
                        top: bestBadgePos.top,
                        width: '12.5%',
                        height: '12.5%',
                      }}
                    >
                      <div className="transform -translate-y-1 translate-x-1 filter drop-shadow-xl scale-110 opacity-95 animate-in zoom-in-75 duration-150">
                        <JudgmentBadgeIcon type="BEST" size={26} />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* On-Board Suggested Move Action Strip (Directly Below Chessboard - Errors only) */}
            {hasSuggestion && bestMoveInfo && currentMove && (
              <div className="bg-[#1e1c19] border border-[#81b64c]/40 rounded-xl p-2.5 shadow-lg flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c] shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#81b64c] uppercase tracking-wide">
                        Suggested Move:
                      </span>
                      <span className="font-mono font-black text-white text-base bg-[#81b64c]/25 border border-[#81b64c]/50 px-2 py-0.5 rounded shadow-sm">
                        {bestMoveInfo.san}
                      </span>
                      <JudgmentBadgeIcon type="BEST" size={18} />
                    </div>
                    <p className="text-[11px] text-[#a09e9a] truncate">
                      Shown on board with <span className="text-[#81b64c] font-semibold">green arrow</span> (played {currentMove.san})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewMode(viewMode === 'best' ? 'played' : 'best')}
                    title="View board position before mistake with suggested move"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      viewMode === 'best'
                        ? 'bg-[#81b64c] text-white keep-white'
                        : 'bg-[#262421] text-white border border-[#3d3b38] hover:border-[#81b64c]'
                    }`}
                  >
                    <Eye size={13} />
                    <span>{viewMode === 'best' ? 'Best View' : 'Focus Best'}</span>
                  </button>

                  <button
                    onClick={() => setViewMode(viewMode === 'best_preview' ? 'played' : 'best_preview')}
                    title="Play suggested move on board to see result"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm ${
                      viewMode === 'best_preview'
                        ? 'bg-[#81b64c] text-white keep-white'
                        : 'bg-[#262421] text-[#81b64c] border border-[#81b64c]/40 hover:bg-[#81b64c]/20'
                    }`}
                  >
                    <Play size={11} className="fill-current" />
                    <span>Play ▶</span>
                  </button>

                  {viewMode !== 'played' && (
                    <button
                      onClick={() => setViewMode('played')}
                      title="Return to played move"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#262421] text-[#a09e9a] hover:text-white border border-[#3d3b38] transition cursor-pointer"
                    >
                      Played ↩
                    </button>
                  )}
                </div>
              </div>
            )}

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

              <div className="flex items-center gap-2">
                {hasSuggestion && bestMoveInfo && currentMove && (
                  <button
                    onClick={() => setViewMode(viewMode === 'best' ? 'played' : 'best')}
                    title="Toggle suggested best move on board"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      viewMode === 'best'
                        ? 'bg-[#81b64c] text-white keep-white'
                        : 'bg-[#1e1c19] text-[#81b64c] border border-[#81b64c]/40 hover:bg-[#81b64c]/20'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Best: {bestMoveInfo.san}</span>
                  </button>
                )}

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
              <div
                className={`border p-3.5 rounded-xl text-center shadow-lg relative overflow-hidden group ${
                  theme === 'white'
                    ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-300/60 shadow-sm'
                    : theme === 'black'
                    ? 'bg-gradient-to-b from-[#121215] to-[#09090b] border-emerald-500/30'
                    : 'bg-gradient-to-b from-[#1e1c19] to-[#24221e] border-emerald-500/25'
                }`}
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-75" />
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#a09e9a] font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-sm" />
                  <span>White</span>
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                  {report.whiteAccuracy}%
                </div>
                <div className="w-full bg-[#302e2b] h-2 rounded-full mt-2.5 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-[#81b64c] to-lime-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(129,182,76,0.6)]"
                    style={{ width: `${report.whiteAccuracy}%` }}
                  />
                </div>
              </div>

              <div
                className={`border p-3.5 rounded-xl text-center shadow-lg relative overflow-hidden group ${
                  theme === 'white'
                    ? 'bg-gradient-to-b from-sky-50/80 to-white border-sky-300/60 shadow-sm'
                    : theme === 'black'
                    ? 'bg-gradient-to-b from-[#121215] to-[#09090b] border-sky-500/30'
                    : 'bg-gradient-to-b from-[#1e1c19] to-[#24221e] border-sky-500/25'
                }`}
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-75" />
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#a09e9a] font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#181614] border border-slate-600 shadow-sm" />
                  <span>Black</span>
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                  {report.blackAccuracy}%
                </div>
                <div className="w-full bg-[#302e2b] h-2 rounded-full mt-2.5 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                    style={{ width: `${report.blackAccuracy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coach Speech Bubble with 3D Royal Avatar */}
            <div className="bg-[#1e1c19] border border-[#3d3b38] p-3.5 rounded-xl flex items-start gap-3.5 text-xs leading-relaxed text-[#c3c2c1] relative overflow-hidden shadow-inner">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-[#81b64c]/40 shrink-0 mt-0.5 bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5">
                <img
                  src="/icons/royal-king.jpg"
                  alt="Grandmaster Coach"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white">Grandmaster Coach</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#81b64c]/20 text-[#81b64c] rounded border border-[#81b64c]/30">
                    AI Review
                  </span>
                </div>
                <span className="text-[#a09e9a] font-medium">{getCoachSummary()}</span>
              </div>
            </div>
          </div>

          {/* Current Move Explanation Card with Dynamic Verdict Glow */}
          <div
            className={`bg-[#262421] border rounded-xl p-5 shadow-xl transition-all duration-300 ${getVerdictGlow(
              currentMove?.judgment
            )}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8b8987] uppercase tracking-wider">
                Move Verdict
              </span>
              {currentMove && (
                <div className="flex items-center gap-2">
                  <JudgmentBadgeIcon type={currentMove.judgment} size={22} />
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border shadow-sm ${
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
                {/* Played vs Best Move Interactive Comparison Card */}
                {hasSuggestion && bestMoveInfo && (
                  <div className="bg-[#1e1c19] p-2 rounded-xl border border-[#3d3b38] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* You Played Button */}
                      <button
                        onClick={() => setViewMode('played')}
                        className={`p-2.5 rounded-lg text-left transition cursor-pointer flex items-center justify-between border ${
                          viewMode === 'played'
                            ? 'bg-rose-500/10 border-rose-500/50 shadow-sm'
                            : 'bg-[#262421] border-[#3d3b38] hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] text-[#8b8987] uppercase font-bold block">You Played</span>
                          <span className="font-mono text-base font-black text-white">{currentMove.san}</span>
                        </div>
                        <JudgmentBadgeIcon type={currentMove.judgment} size={22} />
                      </button>

                      {/* Best Move Button */}
                      <button
                        onClick={() => setViewMode(viewMode === 'best' ? 'played' : 'best')}
                        className={`p-2.5 rounded-lg text-left transition cursor-pointer flex items-center justify-between border ${
                          viewMode === 'best' || viewMode === 'best_preview'
                            ? 'bg-gradient-to-r from-emerald-600/30 to-[#81b64c]/30 border-[#81b64c] shadow-md shadow-emerald-500/20'
                            : 'bg-[#81b64c]/10 border-[#81b64c]/30 hover:bg-[#81b64c]/20'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] text-[#81b64c] uppercase font-bold block flex items-center gap-1">
                            <Sparkles size={10} /> Suggested
                          </span>
                          <span className="font-mono text-base font-black text-white">{bestMoveInfo.san}</span>
                        </div>
                        <JudgmentBadgeIcon type="BEST" size={22} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px] text-[#81b64c]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#81b64c] inline-block animate-pulse" />
                        Suggested move arrow is drawn directly on the board
                      </span>
                    </div>
                  </div>
                )}

                {/* Move Details & Engine Eval */}
                <div className="flex items-baseline justify-between bg-[#1e1c19] p-3 rounded-lg border border-[#3d3b38]">
                  <div>
                    <span className="text-[10px] text-[#8b8987] uppercase font-bold">
                      {viewMode === 'best' ? 'Engine Best Move' : 'Move'}
                    </span>
                    <div className="text-xl font-black text-white font-mono">
                      {currentMove.moveNumber}. {currentMove.playerColor === 'black' ? '...' : ''}
                      {viewMode === 'best' ? bestMoveInfo?.san || currentMove.san : currentMove.san}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8b8987] uppercase font-bold">Engine Eval</span>
                    <div className="text-lg font-black text-[#81b64c] font-mono">
                      {viewMode === 'best' && currentMove.bestEvalScore != null
                        ? (currentMove.bestEvalScore >= 0 ? `+${currentMove.bestEvalScore.toFixed(2)}` : currentMove.bestEvalScore.toFixed(2))
                        : currentMove.evalText}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1c19] p-3 rounded-lg border border-[#3d3b38] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#c3c2c1]">
                    <span className="text-[#8b8987]">Engine Best Move:</span>
                    <span className="font-mono font-bold text-[#81b64c] bg-[#81b64c]/10 px-2 py-0.5 rounded border border-[#81b64c]/20">
                      {bestMoveInfo ? `${bestMoveInfo.san} (${currentMove.bestMoveUci})` : currentMove.bestMoveUci || '—'}
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
                    {hasSuggestion && bestMoveInfo ? (
                      <>
                        <span className="font-bold text-white block mb-1">
                          {currentMove.judgment === 'BLUNDER'
                            ? 'Critical Blunder!'
                            : currentMove.judgment === 'MISTAKE'
                            ? 'Mistake'
                            : 'Inaccuracy'}
                        </span>
                        <span>
                          {currentMove.san} lost {currentMove.winChanceLoss}% win probability.{' '}
                          <span className="text-[#81b64c] font-semibold">{bestMoveInfo.san}</span> was the best continuation.
                        </span>
                      </>
                    ) : (
                      currentMove.explanation
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#8b8987] py-6 text-center">
                Initial starting position. Click &quot;Next&quot; or press Right Arrow to review moves.
              </div>
            )}
          </div>

          {/* All Move Classification Counts (Vibrant Chess.com Badged Table) */}
          <div className="bg-[#262421] border border-[#3d3b38] rounded-xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-[#8b8987] uppercase tracking-wider mb-3">
              Move Classification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-[#1e1c19] hover:bg-[#1baca6]/10 p-2 rounded-lg border border-[#1baca6]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BRILLIANT" size={17} />
                  <span className="text-[11px] font-bold text-[#1baca6]">Brilliant</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBrilliantMoves} | {report.blackBrilliantMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#5c8bb0]/10 p-2 rounded-lg border border-[#5c8bb0]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="GREAT" size={17} />
                  <span className="text-[11px] font-bold text-[#5c8bb0]">Great</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteGreatMoves} | {report.blackGreatMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#81b64c]/10 p-2 rounded-lg border border-[#81b64c]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BEST" size={17} />
                  <span className="text-[11px] font-bold text-[#81b64c]">Best</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBestMoves} | {report.blackBestMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#96bc4b]/10 p-2 rounded-lg border border-[#96bc4b]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="EXCELLENT" size={17} />
                  <span className="text-[11px] font-bold text-[#96bc4b]">Excellent</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteExcellentMoves} | {report.blackExcellentMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#a3b18a]/10 p-2 rounded-lg border border-[#a3b18a]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="GOOD" size={17} />
                  <span className="text-[11px] font-bold text-[#a3b18a]">Good</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteGoodMoves} | {report.blackGoodMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#a88865]/10 p-2 rounded-lg border border-[#a88865]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BOOK" size={17} />
                  <span className="text-[11px] font-bold text-[#d5a47d]">Book</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteBookMoves} | {report.blackBookMoves}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#f0c15c]/10 p-2 rounded-lg border border-[#f0c15c]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="INACCURACY" size={17} />
                  <span className="text-[11px] font-bold text-[#f0c15c]">Inaccuracy</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteInaccuracies} | {report.blackInaccuracies}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#e58f2a]/10 p-2 rounded-lg border border-[#e58f2a]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="MISTAKE" size={17} />
                  <span className="text-[11px] font-bold text-[#e58f2a]">Mistake</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteMistakes} | {report.blackMistakes}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#db4373]/10 p-2 rounded-lg border border-[#db4373]/30 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="MISSED_WIN" size={17} />
                  <span className="text-[11px] font-bold text-[#db4373]">Missed Win</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {report.whiteMissedWins} | {report.blackMissedWins}
                </span>
              </div>

              <div className="bg-[#1e1c19] hover:bg-[#ca3431]/15 p-2 rounded-lg border border-[#ca3431]/40 flex items-center justify-between transition">
                <div className="flex items-center gap-1.5">
                  <JudgmentBadgeIcon type="BLUNDER" size={17} />
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
                        setViewMode('played');
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
                          setViewMode('played');
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
                    setViewMode('played');
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
