import React from 'react';
import { ChessPawn } from './ChessIcons';
import { FileText, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenPgnModal: () => void;
  stockfishReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPgnModal, stockfishReady }) => {
  return (
    <header className="border-b border-[#3d3b38] bg-[#262421] sticky top-0 z-40 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#81b64c] flex items-center justify-center shadow text-white">
            <ChessPawn size={24} className="text-white drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Chess Game Review
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-black px-1.5 py-0.5 rounded bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
                STOCKFISH 19
              </span>
            </div>
            <p className="text-[11px] text-[#a09e9a] font-medium">Deep Engine Analysis & Accuracy Breakdown</p>
          </div>
        </div>

        {/* Engine status & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-[#1e1c19] border border-[#3d3b38] text-[#c3c2c1] shadow-inner">
            <Cpu className={`w-3.5 h-3.5 ${stockfishReady ? 'text-[#81b64c]' : 'text-[#f0c15c] animate-spin'}`} />
            <span className="font-semibold text-[11px]">
              {stockfishReady ? 'Stockfish 19 Engine Ready' : 'Connecting Engine...'}
            </span>
          </div>

          <button
            onClick={onOpenPgnModal}
            className="chess-btn-secondary flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#81b64c]" />
            <span>Paste PGN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
