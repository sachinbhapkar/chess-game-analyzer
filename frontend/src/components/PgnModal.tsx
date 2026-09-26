import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { ChessKnight } from './ChessIcons';

interface PgnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (pgn: string) => void;
  loading: boolean;
}

const SAMPLE_PGN = `[Event "World Championship"]
[Site "London"]
[Date "2018.11.28"]
[White "Carlsen, Magnus"]
[Black "Caruana, Fabiano"]
[Result "1-0"]

1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. Nf3 Nc6 7. O-O Be7 8. a3 O-O 9. b4 Be6 10. Rb1 f6 1-0`;

export const PgnModal: React.FC<PgnModalProps> = ({ isOpen, onClose, onAnalyze, loading }) => {
  const [pgnText, setPgnText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pgnText.trim()) {
      onAnalyze(pgnText.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#262421] border border-[#3d3b38] rounded-xl w-full max-w-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#8b8987] hover:text-white hover:bg-[#3d3b38] rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-[#81b64c]">
            <ChessKnight size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Import Custom PGN</h3>
            <p className="text-xs text-[#a09e9a]">Paste any PGN from Chess.com or tournament games</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={8}
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              placeholder="Paste PGN here, e.g.:&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
              className="w-full bg-[#1e1c19] border border-[#3d3b38] rounded-lg p-3.5 text-xs font-mono text-[#e2e1e0] placeholder-[#8b8987] focus:outline-none focus:border-[#81b64c] transition resize-none shadow-inner"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPgnText(SAMPLE_PGN)}
              className="text-xs text-[#81b64c] hover:underline font-semibold cursor-pointer"
            >
              Load Sample World Championship PGN
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="chess-btn-secondary px-4 py-2 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !pgnText.trim()}
                className="chess-btn-green flex items-center gap-1.5 px-5 py-2 text-xs rounded-lg cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Evaluating...' : 'Review Game'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
