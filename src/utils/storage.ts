import { Game, RoundResult, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'wl_users',
  CURRENT_USER: 'wl_current_user',
  GAMES: 'wl_games',
  ROUND_RESULTS: 'wl_round_results',
  GAME_WORDS: 'wl_game_words',
} as const;

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

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

export function setCurrentUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
