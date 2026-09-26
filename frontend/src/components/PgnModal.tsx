import React, { useState } from 'react';
import { X, Sparkles, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Import Custom PGN</h3>
            <p className="text-xs text-slate-400">Paste any PGN text from Chess.com or Lichess</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={8}
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              placeholder="Paste PGN here, e.g.:&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPgnText(SAMPLE_PGN)}
              className="text-xs text-emerald-400 hover:underline"
            >
              Load sample game
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !pgnText.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loading ? 'Analyzing...' : 'Run Stockfish Engine'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
