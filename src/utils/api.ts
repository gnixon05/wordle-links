import { User, Game, RoundResult, WordleImportedStats } from '../types';

const SESSION_KEY = 'wl_session_token';
const SESSION_COOKIE = 'wl_session';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function getSessionToken(): string | null {
  // Try localStorage first, fall back to cookie (mobile browsers sometimes clear localStorage)
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = getCookie(SESSION_COOKIE);
    if (token) {
      // Restore to localStorage from cookie
      try { localStorage.setItem(SESSION_KEY, token); } catch { /* quota exceeded, cookie is enough */ }
    }
  }
  return token;
}

function setSessionToken(token: string | null): void {
  if (token) {
    try { localStorage.setItem(SESSION_KEY, token); } catch { /* ignore */ }
    setCookie(SESSION_COOKIE, token, 365);
  } else {
    localStorage.removeItem(SESSION_KEY);
    removeCookie(SESSION_COOKIE);
  }
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    const body = await res.json();

    if (!res.ok) {
      return { error: body.error || `Request failed (${res.status})` };
    }

    return { data: body as T };
  } catch (err) {
    console.error('[API]', err);
    return { error: 'Network error. Is the server running?' };
  }
}

// ---------- Auth API ----------

interface AuthResponse {
  sessionId: string;
  user: User;
}

export async function apiSignup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nickname?: string;
  avatar: { category: string; variant: string };
}): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.data) {
    setSessionToken(result.data.sessionId);
    return { user: result.data.user };
  }
  return { error: result.error };
}

export async function apiLogin(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.data) {
    setSessionToken(result.data.sessionId);
    return { user: result.data.user };
  }
  return { error: result.error };
}

export async function apiLogout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  setSessionToken(null);
}

export async function apiGetMe(): Promise<{ user?: User; error?: string }> {
  const token = getSessionToken();
  if (!token) return { error: 'No session' };

  // Use a direct fetch so we can distinguish 401 (invalid session) from network errors.
  // Only clear the token on a definitive 401 — never on network failures,
  // which are common on mobile when resuming from background.
  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    });

    if (res.ok) {
      const body = await res.json();
      return { user: body.user };
    }

    // Server explicitly rejected the session — clear it
    if (res.status === 401) {
      setSessionToken(null);
      return { error: 'Session expired' };
    }

    // Other server errors (500, 502, etc.) — keep the token, let the user retry
    return { error: `Server error (${res.status})` };
  } catch {
    // Network error (offline, DNS failure, etc.) — keep the token intact
    return { error: 'Network error' };
  }
}

// ---------- User API ----------

export async function apiGetUsers(): Promise<User[]> {
  const result = await apiRequest<User[]>('/api/users');
  return result.data || [];
}

export async function apiGetUser(userId: string): Promise<User | null> {
  const result = await apiRequest<User>(`/api/users/${userId}`);
  return result.data || null;
}

export async function apiUpdateProfile(
  userId: string,
  updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar' | 'theme'>>
): Promise<{ user?: User; error?: string }> {
  const result = await apiRequest<User>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (result.data) return { user: result.data };
  return { error: result.error };
}

// ---------- Games API ----------

export async function apiGetGames(): Promise<Game[]> {
  const result = await apiRequest<Game[]>('/api/games');
  return result.data || [];
}

export async function apiGetGame(gameId: string): Promise<Game | null> {
  const result = await apiRequest<Game>(`/api/games/${gameId}`);
  return result.data || null;
}

export async function apiCreateGame(game: Game, words: string[], startWords: string[]): Promise<Game | null> {
  const result = await apiRequest<Game>('/api/games', {
    method: 'POST',
    body: JSON.stringify({ game, words, startWords }),
  });
  return result.data || null;
}

export async function apiUpdateGame(gameId: string, updates: {
  playerIds?: string[];
  invitedUserIds?: string[];
  currentRound?: number;
  rounds?: Game['rounds'];
}): Promise<Game | null> {
  const result = await apiRequest<Game>(`/api/games/${gameId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return result.data || null;
}

export async function apiDeleteGame(gameId: string): Promise<boolean> {
  const result = await apiRequest<{ success: boolean }>(`/api/games/${gameId}`, {
    method: 'DELETE',
  });
  return !!result.data?.success;
}

export async function apiFinalizeCompletedGames(): Promise<{ finalized: string[]; count: number }> {
  const result = await apiRequest<{ finalized: string[]; count: number }>('/api/games/finalize-completed', {
    method: 'POST',
  });
  return result.data || { finalized: [], count: 0 };
}

// ---------- Game Words API ----------

export async function apiGetGameWords(gameId: string, roundNumber: number): Promise<string[]> {
  const result = await apiRequest<string[]>(`/api/games/${gameId}/words/${roundNumber}`);
  return result.data || [];
}

export async function apiSaveGameWords(gameId: string, roundNumber: number, words: string[]): Promise<void> {
  await apiRequest(`/api/games/${gameId}/words/${roundNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ words }),
  });
}

// ---------- Game Start Words API ----------

export async function apiGetStartWords(gameId: string, roundNumber: number): Promise<string[]> {
  const result = await apiRequest<string[]>(`/api/games/${gameId}/start-words/${roundNumber}`);
  return result.data || [];
}

export async function apiSaveStartWords(gameId: string, roundNumber: number, words: string[]): Promise<void> {
  await apiRequest(`/api/games/${gameId}/start-words/${roundNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ words }),
  });
}

// ---------- Round Results API ----------

export async function apiGetAllResults(): Promise<RoundResult[]> {
  const result = await apiRequest<RoundResult[]>('/api/results');
  return result.data || [];
}

export async function apiGetGameResults(gameId: string): Promise<RoundResult[]> {
  const result = await apiRequest<RoundResult[]>(`/api/games/${gameId}/results`);
  return result.data || [];
}

export async function apiGetUserResult(gameId: string, roundNumber: number, userId: string): Promise<RoundResult | null> {
  const result = await apiRequest<RoundResult | null>(`/api/games/${gameId}/results/${roundNumber}/${userId}`);
  return result.data || null;
}

export async function apiGetUserResults(userId: string): Promise<RoundResult[]> {
  const result = await apiRequest<RoundResult[]>(`/api/users/${userId}/results`);
  return result.data || [];
}

export async function apiSaveResult(result: RoundResult): Promise<void> {
  await apiRequest('/api/results', {
    method: 'PUT',
    body: JSON.stringify(result),
  });
}

// ---------- Wordle Imported Stats API ----------

export async function apiGetWordleStats(userId: string): Promise<WordleImportedStats | null> {
  const result = await apiRequest<WordleImportedStats | null>(`/api/users/${userId}/wordle-stats`);
  return result.data || null;
}

export async function apiSaveWordleStats(userId: string, stats: WordleImportedStats): Promise<void> {
  await apiRequest(`/api/users/${userId}/wordle-stats`, {
    method: 'PUT',
    body: JSON.stringify(stats),
  });
}

export async function apiClearWordleStats(userId: string): Promise<void> {
  await apiRequest(`/api/users/${userId}/wordle-stats`, {
    method: 'DELETE',
  });
}

export { getSessionToken, setSessionToken };
