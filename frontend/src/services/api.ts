import type { EngineInfo, GameAnalysisReport, GameSummary, PlayerProfile, PlayerSuggestion } from '../types/chess';

const API_BASE = '/api';

export async function fetchPlayerProfile(username: string): Promise<PlayerProfile> {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(username.trim())}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch player "${username}": ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPlayerSuggestions(query: string, limit = 8): Promise<PlayerSuggestion[]> {
  try {
    const res = await fetch(`${API_BASE}/players/suggest?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchRecentGames(username: string, limit = 15): Promise<GameSummary[]> {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(username.trim())}/games?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch games for "${username}": ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEngines(): Promise<EngineInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/engines`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

export async function analyzeGamePgn(
  pgn: string,
  depth = 10,
  movetimeMs = 0,
  engineId?: string
): Promise<GameAnalysisReport> {
  const res = await fetch(`${API_BASE}/analysis/pgn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pgn, depth, movetimeMs, engineId }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Analysis failed with status ${res.status}`);
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  stockfishBinary: string;
}> {
  const res = await fetch(`${API_BASE}/analysis/health`);
  if (!res.ok) {
    throw new Error('Backend health check failed');
  }
  return res.json();
}
