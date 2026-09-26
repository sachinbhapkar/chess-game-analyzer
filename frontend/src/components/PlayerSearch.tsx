import React, { useState } from 'react';
import { Search, Trophy, Zap, Clock, Shield, Flame } from 'lucide-react';
import type { PlayerProfile } from '../types/chess';

interface PlayerSearchProps {
  onSearch: (username: string) => void;
  profile: PlayerProfile | null;
  loading: boolean;
}

const POPULAR_PLAYERS = ['hikaru', 'magnuscarlsen', 'danielnaroditsky', 'nihalsarin2004'];

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSearch, profile, loading }) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const rapidRating = profile?.stats?.chess_rapid?.last?.rating;
  const blitzRating = profile?.stats?.chess_blitz?.last?.rating;
  const bulletRating = profile?.stats?.chess_bullet?.last?.rating;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Chess.com Player Lookup
          </h2>
          <p className="text-sm text-slate-400">Search any Chess.com user to load their recent rated games</p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. hikaru, magnuscarlsen"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-500/20 whitespace-nowrap cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1 font-medium text-slate-300">
          <Flame className="w-3.5 h-3.5 text-orange-400" /> Popular:
        </span>
        {POPULAR_PLAYERS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setInputVal(p);
              onSearch(p);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {profile && (
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-950/60 p-4 rounded-xl border">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xl text-emerald-400 border border-slate-700">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {profile.title && (
                  <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[11px] font-black tracking-wider uppercase">
                    {profile.title}
                  </span>
                )}
                <span className="text-lg font-bold text-white">{profile.username}</span>
                {profile.name && <span className="text-sm text-slate-400">({profile.name})</span>}
              </div>
              <p className="text-xs text-slate-500">
                Followers: {profile.followers?.toLocaleString() || 0} •{' '}
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Chess.com Profile ↗
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Clock className="w-3 h-3 text-emerald-400" /> Rapid
              </div>
              <div className="text-base font-bold text-white">{rapidRating || 'N/A'}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" /> Blitz
              </div>
              <div className="text-base font-bold text-white">{blitzRating || 'N/A'}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Shield className="w-3 h-3 text-cyan-400" /> Bullet
              </div>
              <div className="text-base font-bold text-white">{bulletRating || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
