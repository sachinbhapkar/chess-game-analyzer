import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Circle, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import {
  useTheme,
  THEME_OPTIONS,
  WALLPAPER_OPTIONS,
  type AppTheme,
} from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, wallpaper, setWallpaper } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'wallpaper'>('theme');
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
        title="Theme & Background Wallpaper settings"
        className="flex items-center gap-1.5 sm:gap-2 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1e1c19]/80 backdrop-blur-md hover:bg-[#2c2a27] border border-[#3d3b38] hover:border-[#81b64c]/60 text-[#c3c2c1] shadow-inner transition cursor-pointer"
      >
        {renderIcon(theme)}
        <span className="font-bold text-[11px] text-white hidden sm:inline">
          {activeOption.name.replace(' Theme', '')}
        </span>
        <ChevronDown size={12} className="text-[#8b8987]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#21201d]/95 backdrop-blur-xl border border-[#3d3b38] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Tabs: Theme vs Wallpaper */}
          <div
            className={`flex items-center p-0.5 rounded-lg border mb-2 text-xs font-bold ${
              theme === 'white'
                ? 'bg-slate-100 border-slate-200'
                : theme === 'black'
                ? 'bg-[#121215] border-[#27272a]'
                : 'bg-[#181614] border-[#3d3b38]'
            }`}
          >
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-1 rounded-md transition text-center cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-[#81b64c] text-white shadow keep-white'
                  : theme === 'white'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#8b8987] hover:text-white'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setActiveTab('wallpaper')}
              className={`flex-1 py-1 rounded-md transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'wallpaper'
                  ? 'bg-[#81b64c] text-white shadow keep-white'
                  : theme === 'white'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#8b8987] hover:text-white'
              }`}
            >
              <ImageIcon size={12} />
              <span>Wallpaper</span>
            </button>
          </div>

          {activeTab === 'theme' ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#8b8987] uppercase tracking-wider">
                Color Palette
              </div>
              {THEME_OPTIONS.map((opt) => {
                const isSelected = opt.id === theme;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#81b64c]/20 text-white font-bold border border-[#81b64c]/40'
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
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#8b8987] uppercase tracking-wider">
                Ambient Wallpaper
              </div>
              {WALLPAPER_OPTIONS.map((wOpt) => {
                const isSelected = wOpt.id === wallpaper;
                return (
                  <button
                    key={wOpt.id}
                    onClick={() => {
                      setWallpaper(wOpt.id);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#81b64c]/20 text-white font-bold border border-[#81b64c]/40'
                        : 'hover:bg-[#2b2926] text-[#e2e1e0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md border border-[#3d3b38] bg-cover bg-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: wOpt.colorHint,
                          backgroundImage: wOpt.previewUrl ? `url(${wOpt.previewUrl})` : undefined,
                        }}
                      />
                      <div>
                        <div className="text-[12px] font-bold text-white leading-tight">
                          {wOpt.name}
                        </div>
                        <div className="text-[10px] text-[#8b8987] line-clamp-1">
                          {wOpt.tagline}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check size={14} className="text-[#81b64c] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
