import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Game, RoundConfig, RoundResult, HoleResult, HoleConfig, GameVisibility, ThemeOption, StartWordMode, WordMode } from '../types';
import {
  getGames,
  saveGame,
  getGameById,
  deleteGame as deleteGameFromStorage,
  saveRoundResult,
  getRoundResultsForGame,
  getRoundResultsForUser,
  getUserRoundResult,
  getGameWords,
  saveGameWords,
  getGameStartWords,
  saveGameStartWords,
  getAllUsedWordsForGame,
} from '../utils/storage';
import { generateRoundWords, pickStartWord } from '../utils/gameLogic';
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
    startWordMode?: StartWordMode; // legacy: applies to all holes
    startWordTheme?: ThemeOption; // legacy: applies to all holes
    startWordModeFront?: StartWordMode;
    startWordModeBack?: StartWordMode;
    startWordThemeFront?: ThemeOption;
    startWordThemeBack?: ThemeOption;
  };
}

interface GameContextType {
  games: Game[];
  refreshGames: () => void;
  createGame: (data: CreateGameData) => Game;
  joinGame: (gameId: string, password?: string) => { success: boolean; error?: string };
  deleteGame: (gameId: string) => void;
  getGame: (gameId: string) => Game | undefined;
  getWordsForRound: (gameId: string, roundNumber: number) => string[];
  getStartWordsForRound: (gameId: string, roundNumber: number) => string[];
  updateWordForHole: (gameId: string, roundNumber: number, holeIndex: number, word: string) => void;
  submitHoleResult: (gameId: string, roundNumber: number, holeResult: HoleResult) => void;
  getUserResult: (gameId: string, roundNumber: number, userId: string) => RoundResult | undefined;
  getGameResults: (gameId: string) => RoundResult[];
  getUserResults: (userId: string) => RoundResult[];
  isRoundCompleteForAllPlayers: (gameId: string, roundNumber: number) => boolean;
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
    setGames(getGames());
  }, []);

  useEffect(() => {
    refreshGames();
  }, [refreshGames]);

  const createGame = useCallback((data: CreateGameData): Game => {
    if (!user) throw new Error('Must be logged in to create a game');

    const wordMode = data.roundConfig.wordMode || 'custom';

    // Resolve start word modes: prefer per-nine fields, fall back to legacy
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
      }],
      currentRound: 1,
      createdAt: new Date().toISOString(),
    };

    const round = game.rounds[0];

    let words: string[];
    if (wordMode === 'classic') {
      // Classic mode: words will be fetched from the Wordle API on demand
      // Store empty strings as placeholders for all 18 holes
      words = round.holes.map(() => '');
    } else {
      // Custom mode: generate target words from themed lists
      words = generateRoundWords(
        round.holes,
        round.frontNineTheme || 'golf',
        round.backNineTheme || 'golf',
      );
    }

    // Generate start words per hole based on front/back nine modes
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

    saveGame(game);
    saveGameWords(game.id, 1, words);
    if (startWords.length > 0) {
      saveGameStartWords(game.id, 1, startWords);
    }
    refreshGames();
    return game;
  }, [user, refreshGames]);

  const joinGame = useCallback((gameId: string, password?: string) => {
    if (!user) return { success: false, error: 'Must be logged in' };

    const game = getGameById(gameId);
    if (!game) return { success: false, error: 'Game not found' };

    if (game.playerIds.includes(user.id)) {
      return { success: true }; // already joined
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

    game.playerIds.push(user.id);
    saveGame(game);
    refreshGames();
    return { success: true };
  }, [user, refreshGames]);

  const getWordsForRound = useCallback((gameId: string, roundNumber: number): string[] => {
    return getGameWords(gameId, roundNumber);
  }, []);

  const getStartWordsForRound = useCallback((gameId: string, roundNumber: number): string[] => {
    return getGameStartWords(gameId, roundNumber);
  }, []);

  const updateWordForHole = useCallback((gameId: string, roundNumber: number, holeIndex: number, word: string) => {
    const words = getGameWords(gameId, roundNumber);
    if (words.length > holeIndex) {
      words[holeIndex] = word;
      saveGameWords(gameId, roundNumber, words);
    }
  }, []);

  const submitHoleResult = useCallback((gameId: string, roundNumber: number, holeResult: HoleResult) => {
    if (!user) return;

    let existing = getUserRoundResult(gameId, roundNumber, user.id);
    if (!existing) {
      existing = {
        roundNumber,
        userId: user.id,
        gameId,
        holes: [],
        totalScore: 0,
      };
    }

    // Replace or add hole result
    const holeIdx = existing.holes.findIndex(h => h.holeNumber === holeResult.holeNumber);
    if (holeIdx >= 0) {
      existing.holes[holeIdx] = holeResult;
    } else {
      existing.holes.push(holeResult);
    }

    // Sort holes
    existing.holes.sort((a, b) => a.holeNumber - b.holeNumber);

    // Recalculate total
    existing.totalScore = existing.holes.reduce((sum, h) => sum + h.score, 0);

    // Check if round is complete (all 18 holes or however many)
    const game = getGameById(gameId);
    if (game) {
      const round = game.rounds.find(r => r.roundNumber === roundNumber);
      if (round && existing.holes.length === round.holes.length) {
        existing.completedAt = new Date().toISOString();
      }
    }

    saveRoundResult(existing);
  }, [user]);

  const getUserResult = useCallback((gameId: string, roundNumber: number, userId: string) => {
    return getUserRoundResult(gameId, roundNumber, userId);
  }, []);

  const getGameResults = useCallback((gameId: string) => {
    return getRoundResultsForGame(gameId);
  }, []);

  const getUserResults = useCallback((userId: string) => {
    return getRoundResultsForUser(userId);
  }, []);

  const isRoundCompleteForAllPlayers = useCallback((gameId: string, roundNumber: number): boolean => {
    const game = getGameById(gameId);
    if (!game) return false;

    return game.playerIds.every(pid => {
      const result = getUserRoundResult(gameId, roundNumber, pid);
      return result?.completedAt != null;
    });
  }, []);

  const startNewRound = useCallback((gameId: string, roundConfig: RoundConfig) => {
    const game = getGameById(gameId);
    if (!game) return;

    game.rounds.push(roundConfig);
    game.currentRound = roundConfig.roundNumber;

    // Gather all words used in previous rounds to prevent reuse
    const previouslyUsedWords = getAllUsedWordsForGame(gameId);

    // Generate target words for the new round, excluding previously used words
    const words = generateRoundWords(
      roundConfig.holes,
      roundConfig.frontNineTheme || 'golf',
      roundConfig.backNineTheme || 'golf',
      previouslyUsedWords,
    );

    // Generate start words per hole based on front/back nine modes
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

    saveGame(game);
    saveGameWords(game.id, roundConfig.roundNumber, words);
    if (startWords.length > 0) {
      saveGameStartWords(game.id, roundConfig.roundNumber, startWords);
    }
    refreshGames();
  }, [refreshGames]);

  const acceptInvitation = useCallback((gameId: string) => {
    if (!user) return;
    const game = getGameById(gameId);
    if (!game) return;

    if (!game.playerIds.includes(user.id)) {
      game.playerIds.push(user.id);
    }
    game.invitedUserIds = game.invitedUserIds.filter(id => id !== user.id);
    saveGame(game);
    refreshGames();
  }, [user, refreshGames]);

  const declineInvitation = useCallback((gameId: string) => {
    if (!user) return;
    const game = getGameById(gameId);
    if (!game) return;

    game.invitedUserIds = game.invitedUserIds.filter(id => id !== user.id);
    saveGame(game);
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
    return getGameById(gameId);
  }, []);

  const handleDeleteGame = useCallback((gameId: string) => {
    deleteGameFromStorage(gameId);
    refreshGames();
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
