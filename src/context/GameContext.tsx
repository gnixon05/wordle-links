import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Game, RoundConfig, RoundResult, HoleResult, HoleConfig, GameVisibility, ThemeOption, StartWordMode, WordMode, WordConstraints } from '../types';
import {
  apiGetGames,
  apiGetGame,
  apiCreateGame,
  apiUpdateGame,
  apiDeleteGame,
  apiGetGameWords,
  apiSaveGameWords,
  apiGetStartWords,
  apiSaveStartWords,
  apiSaveResult,
  apiGetGameResults,
  apiGetUserResults,
  apiGetUserResult,
} from '../utils/api';
import { generateRoundWords, pickStartWord, pickWordForHole, getHoleAvailability, calculateHoleScore, getMaxGuessesForPar } from '../utils/gameLogic';
import { useAuth } from './AuthContext';

interface CreateGameData {
  name: string;
  visibility: GameVisibility;
  password?: string;
  invitedUserIds: string[];
  roundConfig: {
    holes: HoleConfig[];
    wordMode?: WordMode;
    frontNineTheme?: ThemeOption;
    backNineTheme?: ThemeOption;
    startWordMode?: StartWordMode;
    startWordTheme?: ThemeOption;
    startWordModeFront?: StartWordMode;
    startWordModeBack?: StartWordMode;
    startWordThemeFront?: ThemeOption;
    startWordThemeBack?: ThemeOption;
    winnerPicks?: boolean;
  };
}

interface GameContextType {
  games: Game[];
  refreshGames: () => void;
  createGame: (data: CreateGameData) => Game;
  joinGame: (gameId: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  deleteGame: (gameId: string) => void;
  getGame: (gameId: string) => Game | undefined;
  getWordsForRound: (gameId: string, roundNumber: number) => Promise<string[]>;
  getStartWordsForRound: (gameId: string, roundNumber: number) => Promise<string[]>;
  updateWordForHole: (gameId: string, roundNumber: number, holeIndex: number, word: string) => void;
  submitHoleResult: (gameId: string, roundNumber: number, holeResult: HoleResult) => Promise<void>;
  getUserResult: (gameId: string, roundNumber: number, userId: string) => Promise<RoundResult | null>;
  getGameResults: (gameId: string) => Promise<RoundResult[]>;
  getUserResults: (userId: string) => Promise<RoundResult[]>;
  isRoundCompleteForAllPlayers: (gameId: string, roundNumber: number) => Promise<boolean>;
  autoScoreMissedHoles: (gameId: string, roundNumber: number) => Promise<boolean>;
  updateHoleConstraints: (gameId: string, roundNumber: number, holeNumber: number, constraints: WordConstraints) => Promise<void>;
  startNewRound: (gameId: string, roundConfig: RoundConfig) => void;
  acceptInvitation: (gameId: string) => void;
  declineInvitation: (gameId: string) => void;
  getPublicGames: () => Game[];
  getUserGames: () => Game[];
  getUserInvitations: () => Game[];
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);

  const refreshGames = useCallback(() => {
    apiGetGames().then(setGames).catch(() => setGames([]));
  }, []);

  useEffect(() => {
    refreshGames();
  }, [refreshGames]);

  const createGame = useCallback((data: CreateGameData): Game => {
    if (!user) throw new Error('Must be logged in to create a game');

    const wordMode = data.roundConfig.wordMode || 'custom';

    const startWordModeFront = data.roundConfig.startWordModeFront || data.roundConfig.startWordMode || 'none';
    const startWordModeBack = data.roundConfig.startWordModeBack || data.roundConfig.startWordMode || 'none';
    const startWordThemeFront = data.roundConfig.startWordThemeFront || data.roundConfig.startWordTheme;
    const startWordThemeBack = data.roundConfig.startWordThemeBack || data.roundConfig.startWordTheme;

    const game: Game = {
      id: uuidv4(),
      name: data.name,
      creatorId: user.id,
      visibility: data.visibility,
      password: data.password,
      invitedUserIds: data.invitedUserIds,
      playerIds: [user.id],
      rounds: [{
        roundNumber: 1,
        holes: data.roundConfig.holes,
        wordMode,
        frontNineTheme: data.roundConfig.frontNineTheme,
        backNineTheme: data.roundConfig.backNineTheme,
        startDate: new Date().toISOString(),
        startWordModeFront,
        startWordModeBack,
        startWordThemeFront,
        startWordThemeBack,
        winnerPicks: data.roundConfig.winnerPicks,
      }],
      currentRound: 1,
      createdAt: new Date().toISOString(),
    };

    const round = game.rounds[0];

    let words: string[];
    if (wordMode === 'classic') {
      words = round.holes.map(() => '');
    } else {
      words = generateRoundWords(
        round.holes,
        round.frontNineTheme || 'golf',
        round.backNineTheme || 'golf',
      );
    }

    const hasAnyStartWords = startWordModeFront !== 'none' || startWordModeBack !== 'none';
    let startWords: string[] = [];
    if (hasAnyStartWords) {
      startWords = round.holes.map((hole, idx) => {
        const isFront = idx < 9;
        const holeMode = isFront ? startWordModeFront : startWordModeBack;

        if (holeMode === 'none') return '';

        const holeTheme = holeMode === 'theme'
          ? ((isFront ? startWordThemeFront : startWordThemeBack) || (isFront ? (round.frontNineTheme || 'golf') : (round.backNineTheme || 'golf')))
          : 'golf';
        return pickStartWord(
          game.id,
          hole.holeNumber,
          hole.par,
          holeTheme,
          words[idx],
          hole.customStartWord
        );
      });
    }

    // Save to backend
    apiCreateGame(game, words, startWords).then(() => refreshGames());

    return game;
  }, [user, refreshGames]);

  const joinGame = useCallback(async (gameId: string, password?: string) => {
    if (!user) return { success: false, error: 'Must be logged in' };

    const game = await apiGetGame(gameId);
    if (!game) return { success: false, error: 'Game not found' };

    if (game.playerIds.includes(user.id)) {
      return { success: true };
    }

    if (game.visibility === 'private') {
      if (!game.invitedUserIds.includes(user.id) && game.password) {
        if (password !== game.password) {
          return { success: false, error: 'Incorrect game password' };
        }
      } else if (!game.invitedUserIds.includes(user.id)) {
        return { success: false, error: 'You are not invited to this game' };
      }
    }

    const newPlayerIds = [...game.playerIds, user.id];
    await apiUpdateGame(gameId, { playerIds: newPlayerIds });
    refreshGames();
    return { success: true };
  }, [user, refreshGames]);

  const getWordsForRound = useCallback(async (gameId: string, roundNumber: number): Promise<string[]> => {
    return apiGetGameWords(gameId, roundNumber);
  }, []);

  const getStartWordsForRound = useCallback(async (gameId: string, roundNumber: number): Promise<string[]> => {
    return apiGetStartWords(gameId, roundNumber);
  }, []);

  const updateWordForHole = useCallback((gameId: string, roundNumber: number, holeIndex: number, word: string) => {
    apiGetGameWords(gameId, roundNumber).then(words => {
      if (words.length > holeIndex) {
        words[holeIndex] = word;
        apiSaveGameWords(gameId, roundNumber, words);
      }
    });
  }, []);

  const submitHoleResult = useCallback(async (gameId: string, roundNumber: number, holeResult: HoleResult) => {
    if (!user) return;

    let existing = await apiGetUserResult(gameId, roundNumber, user.id);
    if (!existing) {
      existing = {
        roundNumber,
        userId: user.id,
        gameId,
        holes: [],
        totalScore: 0,
      };
    }

    const holeIdx = existing.holes.findIndex(h => h.holeNumber === holeResult.holeNumber);
    if (holeIdx >= 0) {
      existing.holes[holeIdx] = holeResult;
    } else {
      existing.holes.push(holeResult);
    }

    existing.holes.sort((a, b) => a.holeNumber - b.holeNumber);
    existing.totalScore = existing.holes.reduce((sum, h) => sum + h.score, 0);

    const game = await apiGetGame(gameId);
    if (game) {
      const round = game.rounds.find(r => r.roundNumber === roundNumber);
      if (round && existing.holes.length === round.holes.length) {
        existing.completedAt = new Date().toISOString();
      }
    }

    await apiSaveResult(existing);
  }, [user]);

  const getUserResult = useCallback(async (gameId: string, roundNumber: number, userId: string) => {
    return apiGetUserResult(gameId, roundNumber, userId);
  }, []);

  const getGameResults = useCallback(async (gameId: string) => {
    return apiGetGameResults(gameId);
  }, []);

  const getUserResults = useCallback(async (userId: string) => {
    return apiGetUserResults(userId);
  }, []);

  const isRoundCompleteForAllPlayers = useCallback(async (gameId: string, roundNumber: number): Promise<boolean> => {
    const game = await apiGetGame(gameId);
    if (!game) return false;

    const results = await apiGetGameResults(gameId);
    return game.playerIds.every(pid => {
      const result = results.find(r => r.roundNumber === roundNumber && r.userId === pid);
      return result?.completedAt != null;
    });
  }, []);

  /**
   * Auto-score any missed (expired/past) holes for the current user.
   * Submits DNF results for past holes the player never played.
   * Returns true if any holes were auto-scored.
   */
  const autoScoreMissedHoles = useCallback(async (gameId: string, roundNumber: number): Promise<boolean> => {
    if (!user) return false;

    const game = await apiGetGame(gameId);
    if (!game) return false;

    const round = game.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return false;

    let existing = await apiGetUserResult(gameId, roundNumber, user.id);
    if (!existing) {
      existing = {
        roundNumber,
        userId: user.id,
        gameId,
        holes: [],
        totalScore: 0,
      };
    }

    // Already completed the round
    if (existing.completedAt) return false;

    const words = await apiGetGameWords(gameId, roundNumber);
    let scored = false;

    for (const hole of round.holes) {
      const alreadyPlayed = existing.holes.some(h => h.holeNumber === hole.holeNumber);
      if (alreadyPlayed) continue;

      const availability = getHoleAvailability(round.startDate, hole.holeNumber);
      if (availability !== 'past') continue;

      // This hole has expired and the player never played it — auto-DNF
      const maxGuesses = getMaxGuessesForPar(hole.par);
      const dnfScore = calculateHoleScore(false, maxGuesses, hole.par);
      const targetWord = words[hole.holeNumber - 1] || 'XXXXX';

      const dnfResult: HoleResult = {
        holeNumber: hole.holeNumber,
        guesses: [], // no guesses made
        targetWord,
        solved: false,
        score: dnfScore,
      };

      existing.holes.push(dnfResult);
      scored = true;
    }

    if (!scored) return false;

    existing.holes.sort((a, b) => a.holeNumber - b.holeNumber);
    existing.totalScore = existing.holes.reduce((sum, h) => sum + h.score, 0);

    // Check if round is now complete
    if (existing.holes.length === round.holes.length) {
      existing.completedAt = new Date().toISOString();
    }

    await apiSaveResult(existing);
    return true;
  }, [user]);

  const updateHoleConstraints = useCallback(async (
    gameId: string, roundNumber: number, holeNumber: number, constraints: WordConstraints
  ) => {
    const game = await apiGetGame(gameId);
    if (!game) return;

    const round = game.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return;

    // Update the hole config with the new constraints
    const updatedHoles = round.holes.map(h =>
      h.holeNumber === holeNumber ? { ...h, wordConstraints: constraints } : h
    );

    // Update round with modified holes
    const updatedRounds = game.rounds.map(r =>
      r.roundNumber === roundNumber ? { ...r, holes: updatedHoles } : r
    );

    await apiUpdateGame(gameId, { rounds: updatedRounds });

    // Regenerate the word for this hole with the new constraints
    const words = await apiGetGameWords(gameId, roundNumber);
    if (words.length >= holeNumber) {
      const theme = holeNumber <= 9
        ? (round.frontNineTheme || 'golf')
        : (round.backNineTheme || 'golf');
      const holeConfig = updatedHoles.find(h => h.holeNumber === holeNumber)!;
      const usedWords = words.filter((_, idx) => idx !== holeNumber - 1);
      const newWord = pickWordForHole(theme, holeConfig.par, usedWords, holeConfig.customWord, constraints);
      words[holeNumber - 1] = newWord;
      await apiSaveGameWords(gameId, roundNumber, words);
    }

    refreshGames();
  }, [refreshGames]);

  const startNewRound = useCallback(async (gameId: string, roundConfig: RoundConfig) => {
    const game = await apiGetGame(gameId);
    if (!game) return;

    // Get all previously used words
    const allWords: string[] = [];
    for (const r of game.rounds) {
      const words = await apiGetGameWords(gameId, r.roundNumber);
      allWords.push(...words);
    }

    const words = generateRoundWords(
      roundConfig.holes,
      roundConfig.frontNineTheme || 'golf',
      roundConfig.backNineTheme || 'golf',
      allWords,
    );

    const swModeFront = roundConfig.startWordModeFront || roundConfig.startWordMode || 'none';
    const swModeBack = roundConfig.startWordModeBack || roundConfig.startWordMode || 'none';
    const swThemeFront = roundConfig.startWordThemeFront || roundConfig.startWordTheme;
    const swThemeBack = roundConfig.startWordThemeBack || roundConfig.startWordTheme;
    const hasAnyStartWords = swModeFront !== 'none' || swModeBack !== 'none';
    let startWords: string[] = [];
    if (hasAnyStartWords) {
      startWords = roundConfig.holes.map((hole, idx) => {
        const isFront = idx < 9;
        const holeMode = isFront ? swModeFront : swModeBack;

        if (holeMode === 'none') return '';

        const holeTheme = holeMode === 'theme'
          ? ((isFront ? swThemeFront : swThemeBack) || (isFront ? (roundConfig.frontNineTheme || 'golf') : (roundConfig.backNineTheme || 'golf')))
          : 'golf';
        return pickStartWord(
          game.id,
          hole.holeNumber,
          hole.par,
          holeTheme,
          words[idx],
          hole.customStartWord
        );
      });
    }

    await apiUpdateGame(gameId, {
      currentRound: roundConfig.roundNumber,
      rounds: [...game.rounds, roundConfig],
    });
    await apiSaveGameWords(gameId, roundConfig.roundNumber, words);
    if (startWords.length > 0) {
      await apiSaveStartWords(gameId, roundConfig.roundNumber, startWords);
    }
    refreshGames();
  }, [refreshGames]);

  const acceptInvitation = useCallback(async (gameId: string) => {
    if (!user) return;
    const game = await apiGetGame(gameId);
    if (!game) return;

    const newPlayerIds = game.playerIds.includes(user.id)
      ? game.playerIds
      : [...game.playerIds, user.id];
    const newInvited = game.invitedUserIds.filter(id => id !== user.id);

    await apiUpdateGame(gameId, { playerIds: newPlayerIds, invitedUserIds: newInvited });
    refreshGames();
  }, [user, refreshGames]);

  const declineInvitation = useCallback(async (gameId: string) => {
    if (!user) return;
    const game = await apiGetGame(gameId);
    if (!game) return;

    const newInvited = game.invitedUserIds.filter(id => id !== user.id);
    await apiUpdateGame(gameId, { invitedUserIds: newInvited });
    refreshGames();
  }, [user, refreshGames]);

  const getPublicGames = useCallback(() => {
    return games.filter(g => g.visibility === 'public');
  }, [games]);

  const getUserGames = useCallback(() => {
    if (!user) return [];
    return games.filter(g => g.playerIds.includes(user.id));
  }, [games, user]);

  const getUserInvitations = useCallback(() => {
    if (!user) return [];
    return games.filter(g => g.invitedUserIds.includes(user.id));
  }, [games, user]);

  const getGame = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  const handleDeleteGame = useCallback((gameId: string) => {
    apiDeleteGame(gameId).then(() => refreshGames());
  }, [refreshGames]);

  return (
    <GameContext.Provider value={{
      games,
      refreshGames,
      createGame,
      joinGame,
      deleteGame: handleDeleteGame,
      getGame,
      getWordsForRound,
      getStartWordsForRound,
      updateWordForHole,
      submitHoleResult,
      getUserResult,
      getGameResults,
      getUserResults,
      isRoundCompleteForAllPlayers,
      autoScoreMissedHoles,
      updateHoleConstraints,
      startNewRound,
      acceptInvitation,
      declineInvitation,
      getPublicGames,
      getUserGames,
      getUserInvitations,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
