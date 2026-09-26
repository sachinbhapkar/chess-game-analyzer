import React from 'react';
import { Cpu, FileText, Swords } from 'lucide-react';

interface NavbarProps {
  onOpenPgnModal: () => void;
  stockfishReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPgnModal, stockfishReady }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none flex items-center gap-2">
              Chess.com Game Analyzer
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Deep Stockfish Engine Review & Accuracy Insights</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
            <Cpu className={`w-3.5 h-3.5 ${stockfishReady ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{stockfishReady ? 'Stockfish 19 Engine Ready' : 'Connecting Engine...'}</span>
          </div>

          <button
            onClick={onOpenPgnModal}
            className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Paste PGN
          </button>
        </div>
      </div>
    </header>
  );
};
