import { GuessRow, HolePar, LetterGuess, LetterStatus, HoleResult, KeyboardKey, ThemeOption } from '../types';
import { getWordListByLength, getThemedWordsForTarget, getWordListByLengthForTarget } from '../data/wordLists';

/**
 * Evaluate a guess against the target word.
 * Returns an array of LetterGuess with correct/present/absent statuses.
 */
export function evaluateGuess(guess: string, target: string): GuessRow {
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.toUpperCase();
  const result: LetterGuess[] = [];
  const targetLetters = targetUpper.split('');
  const used = new Array(targetLetters.length).fill(false);

  // First pass: mark correct positions
  for (let i = 0; i < guessUpper.length; i++) {
    if (guessUpper[i] === targetLetters[i]) {
      result.push({ letter: guessUpper[i], status: 'correct' });
      used[i] = true;
    } else {
      result.push({ letter: guessUpper[i], status: 'absent' });
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < guessUpper.length; i++) {
    if (result[i].status === 'correct') continue;
    for (let j = 0; j < targetLetters.length; j++) {
      if (!used[j] && guessUpper[i] === targetLetters[j]) {
        result[i] = { letter: guessUpper[i], status: 'present' };
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Get word length based on par
 */
export function getWordLengthForPar(par: HolePar): number {
  switch (par) {
    case 3: return 4;
    case 4: return 5;
    case 5: return 6;
  }
}

/**
 * Get max guesses based on par
 */
export function getMaxGuessesForPar(par: HolePar): number {
  switch (par) {
    case 3: return 5;
    case 4: return 6;
    case 5: return 7;
  }
}

/**
 * Calculate golf score name based on strokes relative to par
 */
export function getScoreName(strokes: number, par: HolePar): string {
  const diff = strokes - par;
  if (strokes === 1) return 'Hole in One!';
  if (diff === -3) return 'Albatross';
  if (diff === -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double Bogey';
  if (diff === 3) return 'Triple Bogey';
  return `+${diff}`;
}

/**
 * Calculate score relative to par for display (e.g., -1, E, +1)
 */
export function getScoreRelativeToPar(strokes: number, par: HolePar): string {
  const diff = strokes - par;
  if (diff === 0) return 'E';
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

/**
 * Get the score for a completed hole.
 * If not solved, score is max guesses + 1 (like not finishing a hole)
 */
export function calculateHoleScore(solved: boolean, guessCount: number, par: HolePar): number {
  if (solved) return guessCount;
  return getMaxGuessesForPar(par) + 1; // DNF penalty
}

/**
 * Calculate total score relative to par for a round
 */
export function calculateRoundScoreRelativeToPar(holes: HoleResult[], holeConfigs: { par: HolePar }[]): number {
  let total = 0;
  for (let i = 0; i < holes.length; i++) {
    const par = holeConfigs[i]?.par || 4;
    total += holes[i].score - par;
  }
  return total;
}

/**
 * Validate if a word is in the valid word list
 */
export function isValidWord(word: string, length: number): boolean {
  const validWords = getWordListByLength(length);
  return validWords.includes(word.toUpperCase());
}

/**
 * Pick a random word from themed list for a hole
 */
export function pickWordForHole(
  theme: string,
  par: HolePar,
  usedWords: string[],
  customWord?: string
): string {
  if (customWord) return customWord.toUpperCase();

  const wordLength = getWordLengthForPar(par);
  const themedWords = getThemedWordsForTarget(theme, wordLength);
  const available = themedWords.filter(w => !usedWords.includes(w));

  if (available.length === 0) {
    // Fallback to full list (still excluding plurals)
    const allWords = getWordListByLengthForTarget(wordLength);
    const fallback = allWords.filter(w => !usedWords.includes(w));
    if (fallback.length === 0) return themedWords[0];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Generate words for an entire round based on configuration.
 * Accepts previouslyUsedWords to prevent reuse across rounds within a game/tour.
 */
export function generateRoundWords(
  holes: { par: HolePar; customWord?: string }[],
  frontTheme: string,
  backTheme: string,
  previouslyUsedWords: string[] = []
): string[] {
  const usedWords: string[] = [...previouslyUsedWords];
  const words: string[] = [];

  for (let i = 0; i < holes.length; i++) {
    const hole = holes[i];
    const theme = i < 9 ? frontTheme : backTheme;

    const word = pickWordForHole(theme, hole.par, usedWords, hole.customWord);
    words.push(word);
    usedWords.push(word);
  }

  return words;
}

/**
 * Build keyboard state from all guesses made so far
 */
export function buildKeyboardState(guesses: GuessRow[]): KeyboardKey[] {
  const keyMap = new Map<string, LetterStatus | 'unused'>();

  // Initialize all keys as unused
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(k => keyMap.set(k, 'unused'));

  // Process all guesses
  for (const guess of guesses) {
    for (const { letter, status } of guess) {
      const current = keyMap.get(letter) || 'unused';
      // Priority: correct > present > absent > unused
      if (status === 'correct') {
        keyMap.set(letter, 'correct');
      } else if (status === 'present' && current !== 'correct') {
        keyMap.set(letter, 'present');
      } else if (status === 'absent' && current === 'unused') {
        keyMap.set(letter, 'absent');
      }
    }
  }

  return Array.from(keyMap.entries()).map(([key, status]) => ({ key, status }));
}

/**
 * Check if all letters in a guess row are correct
 */
export function isGuessCorrect(guess: GuessRow): boolean {
  return guess.every(l => l.status === 'correct');
}

/**
 * Create an empty guess row for display
 */
export function createEmptyRow(length: number): GuessRow {
  return Array.from({ length }, () => ({ letter: '', status: 'empty' as LetterStatus }));
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Attempt to fetch the official Wordle word for a given date.
 * Falls back to local word generation if the fetch fails.
 */
export async function fetchDailyWordleWord(dateStr: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.solution?.toUpperCase() || null;
  } catch {
    return null;
  }
}

/**
 * Get display name for a user
 */
export function getDisplayName(firstName: string, lastName: string, nickname?: string): string {
  if (nickname) return nickname;
  return `${firstName} ${lastName.charAt(0)}.`;
}

/**
 * Generate a seeded random number for consistent daily words
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Pick a daily word deterministically based on date and hole number
 */
export function pickDailyWord(
  dateStr: string,
  holeNumber: number,
  gameId: string,
  par: HolePar,
  theme: string,
  customWord?: string
): string {
  if (customWord) return customWord.toUpperCase();

  const wordLength = getWordLengthForPar(par);
  const words = getThemedWordsForTarget(theme, wordLength);
  const seed = `${dateStr}-${gameId}-${holeNumber}`;
  const index = Math.floor(seededRandom(seed) * words.length);
  return words[index];
}

/**
 * Parse a date string (YYYY-MM-DD or ISO) to a local-midnight Date object
 */
export function parseLocalDate(dateStr: string): Date {
  // Handle ISO strings by extracting just the date part
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the date a specific hole becomes available.
 * Hole 1 is available on startDate, hole 2 on startDate + 1 day, etc.
 */
export function getHoleAvailableDate(startDate: string, holeNumber: number): Date {
  const start = parseLocalDate(startDate);
  start.setDate(start.getDate() + (holeNumber - 1));
  return start;
}

/**
 * Get the availability status of a hole for today.
 * Returns 'available' if today is the hole's day,
 * 'locked' if the day hasn't arrived yet,
 * 'past' if the day has already passed.
 */
export function getHoleAvailability(
  startDate: string,
  holeNumber: number
): 'available' | 'locked' | 'past' {
  const today = parseLocalDate(getTodayDateString());
  const holeDate = getHoleAvailableDate(startDate, holeNumber);

  const todayTime = today.getTime();
  const holeTime = holeDate.getTime();

  if (todayTime === holeTime) return 'available';
  if (todayTime < holeTime) return 'locked';
  return 'past';
}

/**
 * Format a date for display (e.g., "Feb 15")
 */
export function formatHoleDate(startDate: string, holeNumber: number): string {
  const date = getHoleAvailableDate(startDate, holeNumber);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get the hole number that is available today (if any)
 */
export function getTodaysHoleNumber(startDate: string, totalHoles: number): number | null {
  for (let i = 1; i <= totalHoles; i++) {
    if (getHoleAvailability(startDate, i) === 'available') {
      return i;
    }
  }
  return null;
}

/**
 * Pick a start word for a hole from the given theme.
 * The start word is the forced first guess (different from the target word).
 * Uses a different seed than target word to avoid collisions.
 */
export function pickStartWord(
  gameId: string,
  holeNumber: number,
  par: HolePar,
  theme: ThemeOption,
  targetWord: string,
  customStartWord?: string
): string {
  if (customStartWord) return customStartWord.toUpperCase();

  const wordLength = getWordLengthForPar(par);
  const words = getThemedWordsForTarget(theme, wordLength);
  const seed = `startword-${gameId}-${holeNumber}`;
  let index = Math.floor(seededRandom(seed) * words.length);
  let word = words[index];

  // Ensure start word is different from target word
  let attempts = 0;
  while (word === targetWord.toUpperCase() && attempts < words.length) {
    index = (index + 1) % words.length;
    word = words[index];
    attempts++;
  }

  return word;
}
