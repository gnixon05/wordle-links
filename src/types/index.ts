export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterGuess {
  letter: string;
  status: LetterStatus;
}

export type GuessRow = LetterGuess[];

export type ThemePreference = 'light' | 'dark';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  nickname?: string;
  avatar: AvatarChoice;
  theme: ThemePreference;
  createdAt: string;
}

export interface AvatarChoice {
  category: 'golfball' | 'penguin';
  variant: string;
}

export type HolePar = 3 | 4 | 5;

export interface HoleConfig {
  holeNumber: number; // 1-18
  par: HolePar;
  customWord?: string; // if manually specified (target word)
  customStartWord?: string; // if manually specified (forced first guess)
}

export type GameVisibility = 'public' | 'private';

export type ThemeOption = 'golf' | 'sports' | 'nature' | 'food' | 'animals' | 'random' | 'custom';

export type StartWordMode = 'theme' | 'custom' | 'none';

export type WordMode = 'classic' | 'custom';

export interface RoundConfig {
  roundNumber: number;
  holes: HoleConfig[];
  wordMode?: WordMode; // 'classic' (Wordle API) or 'custom' (themed/custom words)
  frontNineTheme?: ThemeOption;
  backNineTheme?: ThemeOption;
  startDate: string; // ISO date when round begins
  startWordMode?: StartWordMode; // how first guess is determined (legacy, applies to all holes)
  startWordTheme?: ThemeOption; // theme for generating start words (legacy, applies to all holes)
  startWordModeFront?: StartWordMode; // how first guess is determined for front 9
  startWordModeBack?: StartWordMode; // how first guess is determined for back 9
  startWordThemeFront?: ThemeOption; // theme for front 9 start words (if mode is 'theme')
  startWordThemeBack?: ThemeOption; // theme for back 9 start words (if mode is 'theme')
}

export interface Game {
  id: string;
  name: string;
  creatorId: string;
  visibility: GameVisibility;
  password?: string; // for private games with password
  invitedUserIds: string[];
  playerIds: string[];
  rounds: RoundConfig[];
  currentRound: number;
  createdAt: string;
}

export interface HoleResult {
  holeNumber: number;
  guesses: GuessRow[];
  targetWord: string;
  solved: boolean;
  score: number; // number of guesses used, or par+2 if not solved
}

export interface RoundResult {
  roundNumber: number;
  userId: string;
  gameId: string;
  holes: HoleResult[];
  totalScore: number;
  completedAt?: string;
}

export interface PlayerRoundView {
  userId: string;
  displayName: string;
  avatar: AvatarChoice;
  roundResult?: RoundResult;
  isComplete: boolean;
}

export interface GameInvitation {
  gameId: string;
  gameName: string;
  fromUserId: string;
  fromDisplayName: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: AvatarChoice;
  gamesPlayed: number;
  roundsPlayed: number;
  totalScore: number;
  averageScore: number;
  bestRoundScore: number;
  holesInOne: number;
  eagles: number;
  birdies: number;
}

export interface UserStats {
  gamesPlayed: number;
  roundsPlayed: number;
  holesPlayed: number;
  totalScore: number;
  averageScorePerRound: number;
  averageScorePerHole: number;
  bestRoundScore: number;
  holesInOne: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  currentStreak: number;
  // Wordle-style stats (per hole)
  holesSolved: number;
  winPercentage: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // guessCount -> number of holes
}

export interface KeyboardKey {
  key: string;
  status: LetterStatus | 'unused';
}

export interface WordleImportedStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<string, number>; // "1" through "6" and "fail"
  importedAt: string; // ISO date
  source: 'manual' | 'json'; // how the stats were imported
}
