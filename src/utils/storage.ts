import { Game, RoundResult, User, WordleImportedStats } from '../types';

const STORAGE_KEYS = {
  USERS: 'wl_users',
  CURRENT_USER: 'wl_current_user',
  GAMES: 'wl_games',
  ROUND_RESULTS: 'wl_round_results',
  GAME_WORDS: 'wl_game_words',
  GAME_START_WORDS: 'wl_game_start_words',
} as const;

const SESSION_COOKIE_NAME = 'wl_session';
// Cookie expires in 1 year (365 days)
const SESSION_COOKIE_MAX_AGE_DAYS = 365;

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Users ---

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setItem(STORAGE_KEYS.USERS, users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

// --- Cookie helpers for persistent sessions ---

function setSessionCookie(userId: string): void {
  const maxAge = SESSION_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(userId)};path=/;max-age=${maxAge};SameSite=Lax`;
}

function getSessionCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      const value = decodeURIComponent(valueParts.join('='));
      return value || null;
    }
  }
  return null;
}

function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=;path=/;max-age=0;SameSite=Lax`;
}

export function getCurrentUserId(): string | null {
  // Check localStorage first, fall back to cookie
  const fromStorage = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (fromStorage) return fromStorage;

  // If localStorage was cleared but cookie still exists, restore it
  const fromCookie = getSessionCookie();
  if (fromCookie) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, fromCookie);
    return fromCookie;
  }

  return null;
}

export function setCurrentUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
    setSessionCookie(id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    clearSessionCookie();
  }
}

// --- Games ---

export function getGames(): Game[] {
  return getItem<Game[]>(STORAGE_KEYS.GAMES, []);
}

export function saveGame(game: Game): void {
  const games = getGames();
  const index = games.findIndex(g => g.id === game.id);
  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }
  setItem(STORAGE_KEYS.GAMES, games);
}

export function getGameById(id: string): Game | undefined {
  return getGames().find(g => g.id === id);
}

export function deleteGame(id: string): void {
  const games = getGames().filter(g => g.id !== id);
  setItem(STORAGE_KEYS.GAMES, games);
}

// --- Round Results ---

export function getRoundResults(): RoundResult[] {
  return getItem<RoundResult[]>(STORAGE_KEYS.ROUND_RESULTS, []);
}

export function saveRoundResult(result: RoundResult): void {
  const results = getRoundResults();
  const index = results.findIndex(
    r => r.gameId === result.gameId && r.roundNumber === result.roundNumber && r.userId === result.userId
  );
  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  setItem(STORAGE_KEYS.ROUND_RESULTS, results);
}

export function getRoundResultsForGame(gameId: string): RoundResult[] {
  return getRoundResults().filter(r => r.gameId === gameId);
}

export function getRoundResultsForUser(userId: string): RoundResult[] {
  return getRoundResults().filter(r => r.userId === userId);
}

export function getUserRoundResult(gameId: string, roundNumber: number, userId: string): RoundResult | undefined {
  return getRoundResults().find(
    r => r.gameId === gameId && r.roundNumber === roundNumber && r.userId === userId
  );
}

// --- Game Words (stored separately so they aren't visible in game objects) ---

export function getGameWords(gameId: string, roundNumber: number): string[] {
  const all = getItem<Record<string, string[]>>(STORAGE_KEYS.GAME_WORDS, {});
  return all[`${gameId}_${roundNumber}`] || [];
}

export function saveGameWords(gameId: string, roundNumber: number, words: string[]): void {
  const all = getItem<Record<string, string[]>>(STORAGE_KEYS.GAME_WORDS, {});
  all[`${gameId}_${roundNumber}`] = words;
  setItem(STORAGE_KEYS.GAME_WORDS, all);
}

/**
 * Get all target words used across all rounds of a game.
 * Used to prevent word reuse when generating new rounds.
 */
export function getAllUsedWordsForGame(gameId: string): string[] {
  const all = getItem<Record<string, string[]>>(STORAGE_KEYS.GAME_WORDS, {});
  const usedWords: string[] = [];
  const prefix = `${gameId}_`;
  for (const key of Object.keys(all)) {
    if (key.startsWith(prefix)) {
      usedWords.push(...all[key]);
    }
  }
  return usedWords;
}

// --- Game Start Words (forced first guesses, stored separately) ---

export function getGameStartWords(gameId: string, roundNumber: number): string[] {
  const all = getItem<Record<string, string[]>>(STORAGE_KEYS.GAME_START_WORDS, {});
  return all[`${gameId}_${roundNumber}`] || [];
}

export function saveGameStartWords(gameId: string, roundNumber: number, words: string[]): void {
  const all = getItem<Record<string, string[]>>(STORAGE_KEYS.GAME_START_WORDS, {});
  all[`${gameId}_${roundNumber}`] = words;
  setItem(STORAGE_KEYS.GAME_START_WORDS, all);
}

// --- Imported Wordle Stats ---

const WORDLE_STATS_KEY = 'wl_wordle_imported_stats';

export function getWordleImportedStats(userId: string): WordleImportedStats | null {
  const all = getItem<Record<string, WordleImportedStats>>(WORDLE_STATS_KEY, {});
  return all[userId] || null;
}

export function saveWordleImportedStats(userId: string, stats: WordleImportedStats): void {
  const all = getItem<Record<string, WordleImportedStats>>(WORDLE_STATS_KEY, {});
  all[userId] = stats;
  setItem(WORDLE_STATS_KEY, all);
}

export function clearWordleImportedStats(userId: string): void {
  const all = getItem<Record<string, WordleImportedStats>>(WORDLE_STATS_KEY, {});
  delete all[userId];
  setItem(WORDLE_STATS_KEY, all);
}

// --- Simple password hashing (not cryptographically secure, for demo only) ---

export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}
