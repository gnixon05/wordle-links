import { User, Game, RoundResult, WordleImportedStats } from '../types';

const SESSION_KEY = 'wl_session_token';

function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setSessionToken(token: string | null): void {
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
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

  const result = await apiRequest<{ user: User }>('/api/auth/me');
  if (result.data) {
    return { user: result.data.user };
  }
  setSessionToken(null);
  return { error: result.error };
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
