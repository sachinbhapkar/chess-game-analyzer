import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Zap, Shield, History, X, ChevronRight, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { PlayerProfile, PlayerSuggestion } from '../types/chess';
import { fetchPlayerSuggestions } from '../services/api';

interface PlayerSearchProps {
  onSearch: (username: string) => void;
  profile: PlayerProfile | null;
  loading: boolean;
}

const LOCAL_TOP_PLAYERS: PlayerSuggestion[] = [
  { username: 'sachin-bhapkar', name: 'Sachin Bhapkar', title: undefined, rating: 1885, avatar: 'https://images.chesscomfiles.com/uploads/v1/user/594034692.fc3896a7.200x200o.0c9da0736c17.jpg' },
  { username: 'hikaru', name: 'Hikaru Nakamura', title: 'GM', rating: 3441, avatar: 'https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png' },
  { username: 'magnuscarlsen', name: 'Magnus Carlsen', title: 'GM', rating: 3394, avatar: 'https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.200x200o.361c2f8a59c2.jpg' },
  { username: 'danielnaroditsky', name: 'Daniel Naroditsky', title: 'GM', rating: 3150 },
  { username: 'nihalsarin', name: 'Nihal Sarin', title: 'GM', rating: 3319 },
  { username: 'gukeshd', name: 'Gukesh D', title: 'GM', rating: 3050 },
  { username: 'rpragchess', name: 'Praggnanandhaa', title: 'GM', rating: 3080 },
  { username: 'fabianocaruana', name: 'Fabiano Caruana', title: 'GM', rating: 3200 },
  { username: 'gothamchess', name: 'Levy Rozman', title: 'IM', rating: 2400 },
];

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSearch, profile, loading }) => {
  const { theme } = useTheme();
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>(LOCAL_TOP_PLAYERS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isFetching, setIsFetching] = useState(false);
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

  // Immediate local filter + debounced remote API lookup
  useEffect(() => {
    const q = inputVal.toLowerCase().trim();

    if (!q) {
      setSuggestions(LOCAL_TOP_PLAYERS);
      setIsFetching(false);
      return;
    }

    // Instant local matches first
    const instantLocal = LOCAL_TOP_PLAYERS.filter(
      (p) => p.username.toLowerCase().includes(q) || (p.name && p.name.toLowerCase().includes(q))
    );
    if (instantLocal.length > 0) {
      setSuggestions(instantLocal);
    }

    // Debounced remote lookup
    setIsFetching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await fetchPlayerSuggestions(q, 8);
        if (results && results.length > 0) {
          setSuggestions(results);
        } else if (instantLocal.length === 0) {
          setSuggestions([]);
        }
      } catch {
        // keep local
      } finally {
        setIsFetching(false);
      }
    }, 120);

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
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setShowSuggestions(true);
      }
      return;
    }

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
    <div className="bg-[#262421]/90 backdrop-blur-xl border border-[#3d3b38]/80 rounded-2xl p-5 shadow-2xl mb-6 relative overflow-hidden">
      {/* Top subtle ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-20 bg-gradient-to-b from-[#81b64c]/10 to-transparent blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-black/40 border border-[#81b64c]/40 shrink-0 bg-[#1e1c19] p-0.5 hover:scale-105 transition-transform duration-200">
            <img
              src="/icons/player-review.jpg"
              alt="Player Game Review"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Player Game Review
            </h2>
            <p className="text-xs text-[#a09e9a]">
              Type any player username to evaluate games, accuracy stats, and blunders
            </p>
          </div>
        </div>

        {/* Search input with autocomplete dropdown */}
        <div ref={dropdownRef} className="relative w-full md:w-96">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8b8987] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Chess.com user (e.g. sachin-bhapkar)..."
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="w-full bg-[#1e1c19] border border-[#3d3b38] rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-[#8b8987] focus:outline-none focus:border-[#81b64c] transition shadow-inner font-sans"
              />
              {isFetching ? (
                <Loader2 className="w-3.5 h-3.5 text-[#81b64c] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              ) : inputVal ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8987] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="chess-btn-green px-4 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Reviewing...' : 'Review'}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#21201d] border border-[#3d3b38] rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-[#2d2b28] max-h-80 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div>
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#8b8987] uppercase tracking-wider bg-[#1b1917] flex items-center justify-between">
                    <span>Suggestions</span>
                    <span className="text-[9px] font-normal text-[#a09e9a]">Use ↑↓ to navigate</span>
                  </div>

                  {suggestions.map((s, idx) => (
                    <div
                      key={s.username}
                      onClick={() => handleSelectUsername(s.username)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition ${
                        selectedIndex === idx
                          ? 'bg-[#81b64c]/20 text-white'
                          : 'hover:bg-[#2b2926] text-[#e2e1e0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {s.avatar ? (
                          <img
                            src={s.avatar}
                            alt={s.username}
                            className="w-8 h-8 rounded-md object-cover border border-[#3d3b38]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-[#302e2b] border border-[#3d3b38] flex items-center justify-center font-bold text-xs text-[#81b64c]">
                            {s.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {s.title && (
                              <span className="px-1 py-0.2 rounded bg-[#ca3431] text-white text-[9px] font-black uppercase">
                                {s.title}
                              </span>
                            )}
                            <span className="text-white">{s.username}</span>
                          </div>
                          {s.name && <div className="text-[11px] text-[#a09e9a]">{s.name}</div>}
                        </div>
                      </div>

                      {s.rating && (
                        <div className="text-xs font-mono font-bold text-[#e69d00] bg-[#e69d00]/10 px-2 py-0.5 rounded border border-[#e69d00]/20">
                          {s.rating}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : inputVal.trim() ? (
                <div
                  onClick={() => handleSelectUsername(inputVal.trim())}
                  className="p-3 text-xs text-[#e2e1e0] hover:bg-[#2b2926] cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#81b64c]" />
                    <span>Search for player &quot;<strong className="text-white">{inputVal}</strong>&quot;</span>
                  </div>
                  <span className="text-[10px] text-[#81b64c] font-bold uppercase">Press Enter ↵</span>
                </div>
              ) : (
                /* Recent searches */
                <div>
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#8b8987] uppercase tracking-wider flex items-center gap-1 bg-[#1b1917]">
                        <History className="w-3 h-3 text-[#8b8987]" /> Recent
                      </div>
                      {recentSearches.map((u) => (
                        <div
                          key={u}
                          onClick={() => handleSelectUsername(u)}
                          className="flex items-center justify-between px-3.5 py-2 text-xs text-[#c3c2c1] hover:bg-[#2b2926] cursor-pointer"
                        >
                          <span className="font-semibold text-white">{u}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#5c5955]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loaded Player Banner in Chess.com Card Style */}
      {profile && (
        <div className="mt-4 pt-4 border-t border-[#3d3b38] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1c19] p-4 rounded-lg border border-[#3d3b38]">
          <div className="flex items-center gap-3.5">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-12 h-12 rounded-lg object-cover border-2 border-[#81b64c] shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#302e2b] flex items-center justify-center font-bold text-lg text-[#81b64c] border border-[#3d3b38]">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                {profile.title && (
                  <span className="px-1.5 py-0.2 rounded bg-[#ca3431] text-white text-[10px] font-black uppercase">
                    {profile.title}
                  </span>
                )}
                <span className="text-base font-bold text-white">{profile.username}</span>
                {profile.name && <span className="text-xs text-[#a09e9a]">({profile.name})</span>}
              </div>
              <p className="text-xs text-[#8b8987] mt-0.5">
                Followers: {profile.followers?.toLocaleString() || 0} •{' '}
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#81b64c] hover:underline font-medium"
                >
                  Chess.com Profile ↗
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div
              className={`border px-3.5 py-2.5 rounded-xl text-center shadow-sm ${
                theme === 'white'
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200 shadow-sm'
                  : theme === 'black'
                  ? 'bg-gradient-to-b from-emerald-500/15 to-[#09090b] border-emerald-500/40'
                  : 'bg-gradient-to-b from-emerald-500/15 to-[#262421] border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> Rapid
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{rapidRating || '—'}</div>
            </div>

            <div
              className={`border px-3.5 py-2.5 rounded-xl text-center shadow-sm ${
                theme === 'white'
                  ? 'bg-gradient-to-b from-amber-50 to-white border-amber-200 shadow-sm'
                  : theme === 'black'
                  ? 'bg-gradient-to-b from-amber-500/15 to-[#09090b] border-amber-500/40'
                  : 'bg-gradient-to-b from-amber-500/15 to-[#262421] border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-500 font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Blitz
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{blitzRating || '—'}</div>
            </div>

            <div
              className={`border px-3.5 py-2.5 rounded-xl text-center shadow-sm ${
                theme === 'white'
                  ? 'bg-gradient-to-b from-orange-50 to-white border-orange-200 shadow-sm'
                  : theme === 'black'
                  ? 'bg-gradient-to-b from-orange-500/15 to-[#09090b] border-orange-500/40'
                  : 'bg-gradient-to-b from-orange-500/15 to-[#262421] border-orange-500/40'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-orange-500 font-black uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" /> Bullet
              </div>
              <div className="text-base font-black text-white font-mono mt-0.5">{bulletRating || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
