import React from 'react';
import { ChessKing } from './ChessIcons';
import { FileText, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenPgnModal: () => void;
  stockfishReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPgnModal, stockfishReady }) => {
  return (
    <header className="border-b border-white/[0.08] bg-[#12141a]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center shadow-lg text-emerald-400">
            <ChessKing size={22} className="text-amber-400 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Grandmaster
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PRO REVIEW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Precision Chess Engine & Move Review</p>
          </div>
        </div>

        {/* Engine status & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 shadow-sm">
            <Cpu className={`w-3.5 h-3.5 ${stockfishReady ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
            <span className="font-medium text-[11px]">
              {stockfishReady ? 'Stockfish 19 Engine Active' : 'Connecting Engine...'}
            </span>
          </div>

          <button
            onClick={onOpenPgnModal}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-emerald-500/40 transition shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste PGN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
