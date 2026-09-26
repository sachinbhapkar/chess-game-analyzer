import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Zap, Shield, History, X, ChevronRight } from 'lucide-react';
import { ChessKing, ChessKnight } from './ChessIcons';
import type { PlayerProfile, PlayerSuggestion } from '../types/chess';
import { fetchPlayerSuggestions } from '../services/api';

interface PlayerSearchProps {
  onSearch: (username: string) => void;
  profile: PlayerProfile | null;
  loading: boolean;
}

const FEATURED_PLAYERS = [
  { username: 'hikaru', name: 'Hikaru Nakamura', title: 'GM' },
  { username: 'magnuscarlsen', name: 'Magnus Carlsen', title: 'GM' },
  { username: 'danielnaroditsky', name: 'Daniel Naroditsky', title: 'GM' },
  { username: 'nihalsarin', name: 'Nihal Sarin', title: 'GM' },
  { username: 'gukeshd', name: 'Gukesh D', title: 'GM' },
  { username: 'rpragchess', name: 'Praggnanandhaa', title: 'GM' },
];

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSearch, profile, loading }) => {
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('grandmaster_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveRecentSearch = (user: string) => {
    try {
      const updated = [user, ...recentSearches.filter((u) => u.toLowerCase() !== user.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('grandmaster_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Debounced autocomplete suggestions lookup
  useEffect(() => {
    if (!inputVal.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await fetchPlayerSuggestions(inputVal, 7);
      setSuggestions(results);
    }, 180);

    return () => clearTimeout(timer);
  }, [inputVal]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUsername = (username: string) => {
    setInputVal(username);
    setShowSuggestions(false);
    saveRecentSearch(username);
    onSearch(username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectUsername(suggestions[selectedIndex].username);
      return;
    }
    if (inputVal.trim()) {
      handleSelectUsername(inputVal.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const rapidRating = profile?.stats?.chess_rapid?.last?.rating;
  const blitzRating = profile?.stats?.chess_blitz?.last?.rating;
  const bulletRating = profile?.stats?.chess_bullet?.last?.rating;

  return (
    <div className="bg-[#15171f] border border-white/[0.08] rounded-2xl p-6 shadow-2xl mb-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ChessKnight size={18} />
            </div>
            <span>Player Match Archive</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search any registered chess player to evaluate recent games & blunder statistics
          </p>
        </div>

        {/* Search input with autocomplete dropdown */}
        <div ref={dropdownRef} className="relative w-full md:w-96">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type username (e.g. hikaru)..."
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner font-sans"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/40 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Loading...' : 'Review'}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 bg-[#12141a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/[0.06] backdrop-blur-xl animate-in fade-in duration-150">
              {suggestions.length > 0 ? (
                <div>
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                    Matching Players
                  </div>
                  {suggestions.map((s, idx) => (
                    <div
                      key={s.username}
                      onClick={() => handleSelectUsername(s.username)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition ${
                        selectedIndex === idx ? 'bg-emerald-500/15 text-white' : 'hover:bg-white/[0.04] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {s.avatar ? (
                          <img
                            src={s.avatar}
                            alt={s.username}
                            className="w-7 h-7 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-emerald-400">
                            {s.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {s.title && (
                              <span className="px-1 py-0.2 rounded bg-red-600/90 text-white text-[9px] font-black uppercase">
                                {s.title}
                              </span>
                            )}
                            <span>{s.username}</span>
                          </div>
                          {s.name && <div className="text-[11px] text-slate-400">{s.name}</div>}
                        </div>
                      </div>

                      {s.rating && (
                        <div className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {s.rating}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : inputVal.trim() ? (
                <div className="p-3 text-xs text-slate-400 text-center">
                  Press Enter to search for &quot;<span className="text-white font-medium">{inputVal}</span>&quot;
                </div>
              ) : (
                /* Recent searches & top grandmasters */
                <div>
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-white/[0.02]">
                        <History className="w-3 h-3 text-slate-400" /> Recent
                      </div>
                      {recentSearches.map((u) => (
                        <div
                          key={u}
                          onClick={() => handleSelectUsername(u)}
                          className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.04] cursor-pointer"
                        >
                          <span className="font-medium">{u}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-white/[0.02]">
                    <ChessKing size={12} className="text-amber-400" /> Top Grandmasters
                  </div>
                  {FEATURED_PLAYERS.map((fp) => (
                    <div
                      key={fp.username}
                      onClick={() => handleSelectUsername(fp.username)}
                      className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-300 hover:bg-white/[0.04] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.2 rounded bg-red-600/90 text-white text-[9px] font-black">
                          {fp.title}
                        </span>
                        <span className="font-semibold text-white">{fp.username}</span>
                        <span className="text-[11px] text-slate-400">({fp.name})</span>
                      </div>
                      <span className="text-[11px] text-emerald-400">Select</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Picks Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-slate-400">
        <span className="font-medium text-slate-400 flex items-center gap-1.5">
          <ChessKing size={14} className="text-amber-400" /> Quick picks:
        </span>
        {FEATURED_PLAYERS.map((p) => (
          <button
            key={p.username}
            onClick={() => handleSelectUsername(p.username)}
            className="px-2.5 py-1 rounded-lg bg-[#0d0e12] hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-emerald-500/40 transition text-xs font-medium cursor-pointer"
          >
            <span className="text-red-400 font-bold mr-1">{p.title}</span>
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Loaded Player Card */}
      {profile && (
        <div className="mt-5 pt-5 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[#0e1015] p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500/40 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400 border border-white/10">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {profile.title && (
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
                    {profile.title}
                  </span>
                )}
                <span className="text-lg font-bold text-white">{profile.username}</span>
                {profile.name && <span className="text-xs text-slate-400">({profile.name})</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Followers: {profile.followers?.toLocaleString() || 0} •{' '}
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Public Profile ↗
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#15171f] border border-white/10 px-4 py-2.5 rounded-xl text-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium mb-0.5">
                <Clock className="w-3 h-3 text-emerald-400" /> Rapid
              </div>
              <div className="text-base font-bold text-white font-mono">{rapidRating || '—'}</div>
            </div>
            <div className="bg-[#15171f] border border-white/10 px-4 py-2.5 rounded-xl text-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" /> Blitz
              </div>
              <div className="text-base font-bold text-white font-mono">{blitzRating || '—'}</div>
            </div>
            <div className="bg-[#15171f] border border-white/10 px-4 py-2.5 rounded-xl text-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium mb-0.5">
                <Shield className="w-3 h-3 text-cyan-400" /> Bullet
              </div>
              <div className="text-base font-bold text-white font-mono">{bulletRating || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
