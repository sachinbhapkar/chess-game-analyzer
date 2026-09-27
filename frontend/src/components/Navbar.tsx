import React from 'react';
import { FileText, Cpu, ChevronDown } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { EngineInfo } from '../types/chess';

interface NavbarProps {
  onOpenPgnModal: () => void;
  stockfishReady: boolean;
  activeEngine: EngineInfo | null;
  onOpenEngineModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPgnModal,
  stockfishReady,
  activeEngine,
  onOpenEngineModal,
}) => {
  return (
    <header className="border-b border-[#3d3b38] bg-[#262421]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors shadow-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-[#81b64c]/40 shrink-0 bg-[#1e1c19] p-0.5 hover:scale-105 transition-transform duration-200">
            <img
              src="/icons/brand-logo.jpg"
              alt="Chess Game Review"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Chess Game Review
              </h1>
              <button
                onClick={onOpenEngineModal}
                title="Click to switch chess engine"
                className="text-[10px] tracking-wider uppercase font-black px-2 py-0.5 rounded-md bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30 hover:bg-[#81b64c]/30 hover:border-[#81b64c]/50 transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>{activeEngine ? activeEngine.name : 'STOCKFISH 19'}</span>
                <ChevronDown size={11} />
              </button>
            </div>
            <p className="text-[11px] text-[#a09e9a] font-medium">Multi-Engine Open-Source Analysis & Accuracy</p>
          </div>
        </div>

        {/* Engine selector, Theme switcher & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clickable Engine Selector button */}
          <button
            onClick={onOpenEngineModal}
            title="Click to select open-source engine"
            className="flex items-center gap-2 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1e1c19] hover:bg-[#2c2a27] border border-[#3d3b38] hover:border-[#81b64c]/60 text-[#c3c2c1] shadow-inner transition cursor-pointer"
          >
            <div className="relative">
              <Cpu className="w-3.5 h-3.5 text-[#81b64c]" />
              <span
                className={`w-1.5 h-1.5 rounded-full absolute -top-0.5 -right-0.5 ${
                  stockfishReady ? 'bg-[#81b64c] animate-pulse' : 'bg-[#f0c15c]'
                }`}
              />
            </div>
            <span className="font-bold text-[11px] text-white">
              {activeEngine ? activeEngine.name : 'Stockfish 19'}
            </span>
            <span className="text-[9px] font-mono bg-[#81b64c]/20 text-[#81b64c] px-1.5 py-0.5 rounded font-bold hidden md:inline">
              {activeEngine ? activeEngine.rating : '3550+'}
            </span>
            <ChevronDown size={13} className="text-[#8b8987]" />
          </button>

          {/* Theme Switcher (Dark, Black OLED, White) */}
          <ThemeSwitcher />

          <button
            onClick={onOpenPgnModal}
            className="chess-btn-secondary flex items-center gap-1.5 sm:gap-2 text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#81b64c]" />
            <span className="hidden sm:inline">Paste PGN</span>
            <span className="sm:hidden">PGN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
