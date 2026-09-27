import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Circle, ChevronDown, Check } from 'lucide-react';
import { useTheme, THEME_OPTIONS, type AppTheme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const renderIcon = (id: AppTheme, className = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'white':
        return <Sun className={`${className} text-[#e69d00]`} />;
      case 'black':
        return <Circle className={`${className} text-emerald-400 fill-black`} />;
      case 'dark':
      default:
        return <Moon className={`${className} text-[#81b64c]`} />;
    }
  };

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Switch theme (Dark, Black OLED, White)"
        className="flex items-center gap-2 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1e1c19] hover:bg-[#2c2a27] border border-[#3d3b38] hover:border-[#81b64c]/60 text-[#c3c2c1] shadow-inner transition cursor-pointer"
      >
        {renderIcon(theme)}
        <span className="font-bold text-[11px] text-white hidden sm:inline">
          {activeOption.name.replace(' Theme', '')}
        </span>
        <ChevronDown size={12} className="text-[#8b8987]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#21201d] border border-[#3d3b38] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#8b8987] uppercase tracking-wider border-b border-[#2d2b28] mb-1">
            Display Theme
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#81b64c]/20 text-white font-bold border border-[#81b64c]/30'
                      : 'hover:bg-[#2b2926] text-[#e2e1e0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#1e1c19] border border-[#3d3b38] flex items-center justify-center">
                      {renderIcon(opt.id, 'w-3.5 h-3.5')}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-white leading-tight">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-[#8b8987]">{opt.tagline}</div>
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="text-[#81b64c] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
