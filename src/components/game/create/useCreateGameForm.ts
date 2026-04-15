import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { HoleConfig, HolePar, ThemeOption, GameVisibility, StartWordMode, WordMode, WordConstraints } from '../../../types';

function createDefaultHoles(): HoleConfig[] {
  return Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: 4 as HolePar,
  }));
}

export function useCreateGameForm() {
  const navigate = useNavigate();
  const { createGame } = useGame();

  const [gameName, setGameName] = useState('');
  const [visibility, setVisibility] = useState<GameVisibility>('public');
  const [password, setPassword] = useState('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [holes, setHoles] = useState<HoleConfig[]>(createDefaultHoles());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordMode, setWordMode] = useState<WordMode>('classic');
  const [startWordModeFront, setStartWordModeFront] = useState<StartWordMode>('none');
  const [startWordModeBack, setStartWordModeBack] = useState<StartWordMode>('none');
  const [startWordThemeFront, setStartWordThemeFront] = useState<ThemeOption>('golf');
  const [startWordThemeBack, setStartWordThemeBack] = useState<ThemeOption>('golf');
  const [winnerPicks, setWinnerPicks] = useState(false);
  const [error, setError] = useState('');

  const toggleInvite = (userId: string) => {
    setInvitedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleWordModeChange = (mode: WordMode) => {
    setWordMode(mode);
    setHoles(createDefaultHoles());
  };

  const updateHolePar = (holeNumber: number, par: HolePar) => {
    setHoles(prev => prev.map(h =>
      h.holeNumber === holeNumber ? { ...h, par } : h
    ));
  };

  const updateHoleWord = (holeNumber: number, word: string) => {
    setHoles(prev => prev.map(h =>
      h.holeNumber === holeNumber ? { ...h, customWord: word.toUpperCase() || undefined } : h
    ));
  };

  const updateHoleStartWord = (holeNumber: number, word: string) => {
    setHoles(prev => prev.map(h =>
      h.holeNumber === holeNumber ? { ...h, customStartWord: word.toUpperCase() || undefined } : h
    ));
  };

  const updateHoleConstraint = (holeNumber: number, field: keyof WordConstraints, value: string) => {
    setHoles(prev => prev.map(h => {
      if (h.holeNumber !== holeNumber) return h;
      const constraints: WordConstraints = { ...(h.wordConstraints || {}) };
      if (value) {
        constraints[field] = value.toUpperCase();
      } else {
        delete constraints[field];
      }
      const hasAny = Object.keys(constraints).length > 0;
      return { ...h, wordConstraints: hasAny ? constraints : undefined };
    }));
  };

  /**
   * Strip any hole-level fields that are not visible under the current
   * top-level settings. This ensures that stale state from a previously
   * selected mode (e.g. constraints entered while "none" was selected) isn't
   * silently submitted when the user switches modes before saving.
   */
  const sanitizeHolesForSubmit = (): HoleConfig[] => {
    return holes.map(h => {
      const isFront = h.holeNumber <= 9;
      const isFirstOfNine = h.holeNumber === 1 || h.holeNumber === 10;
      const nineMode = isFront ? startWordModeFront : startWordModeBack;
      const winnerPicksHidesConstraint = winnerPicks && !isFirstOfNine;

      // Custom target word input is only visible when wordMode is 'custom'
      // and winner-picks either isn't on or this is the first hole of a nine.
      const showCustomWord = wordMode === 'custom' && (!winnerPicks || isFirstOfNine);
      // Custom per-hole start word is only visible when the nine's start
      // word mode is 'custom'.
      const showCustomStartWord = nineMode === 'custom';

      const cleaned: HoleConfig = {
        holeNumber: h.holeNumber,
        par: h.par,
      };
      if (showCustomWord && h.customWord) cleaned.customWord = h.customWord;
      if (showCustomStartWord && h.customStartWord) cleaned.customStartWord = h.customStartWord;

      // Constraints are shown in the same cases as HoleCard:
      // hidden when winner-picks hides them, when a custom word is set (value-based),
      // or when the nine uses a custom per-hole start word.
      const showConstraints =
        !winnerPicksHidesConstraint && !cleaned.customWord && !showCustomStartWord;
      if (showConstraints && h.wordConstraints && Object.keys(h.wordConstraints).length > 0) {
        cleaned.wordConstraints = h.wordConstraints;
      }
      return cleaned;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameName.trim()) {
      setError('Please enter a game name.');
      return;
    }

    // Validate custom start words for front 9
    if (startWordModeFront === 'custom') {
      for (const hole of holes.filter(h => h.holeNumber <= 9)) {
        if (!hole.customStartWord) {
          setError(`Please enter a start word for Hole ${hole.holeNumber} or switch front 9 start word mode.`);
          return;
        }
        const expectedLength = hole.par === 3 ? 4 : hole.par === 5 ? 6 : 5;
        if (hole.customStartWord.length !== expectedLength) {
          setError(`Hole ${hole.holeNumber} start word must be ${expectedLength} letters (Par ${hole.par}).`);
          return;
        }
      }
    }

    // Validate custom start words for back 9
    if (startWordModeBack === 'custom') {
      for (const hole of holes.filter(h => h.holeNumber > 9)) {
        if (!hole.customStartWord) {
          setError(`Please enter a start word for Hole ${hole.holeNumber} or switch back 9 start word mode.`);
          return;
        }
        const expectedLength = hole.par === 3 ? 4 : hole.par === 5 ? 6 : 5;
        if (hole.customStartWord.length !== expectedLength) {
          setError(`Hole ${hole.holeNumber} start word must be ${expectedLength} letters (Par ${hole.par}).`);
          return;
        }
      }
    }

    const game = createGame({
      name: gameName.trim(),
      visibility,
      password: visibility === 'private' ? password || undefined : undefined,
      invitedUserIds: visibility === 'private' ? invitedIds : [],
      roundConfig: {
        holes: sanitizeHolesForSubmit(),
        wordMode,
        startWordModeFront,
        startWordModeBack,
        startWordThemeFront: startWordModeFront === 'theme' ? startWordThemeFront : undefined,
        startWordThemeBack: startWordModeBack === 'theme' ? startWordThemeBack : undefined,
        winnerPicks: winnerPicks || undefined,
      },
    });

    navigate(`/game/${game.id}`);
  };

  return {
    // State
    gameName, setGameName,
    visibility, setVisibility,
    password, setPassword,
    invitedIds, toggleInvite,
    holes,
    showAdvanced, setShowAdvanced,
    wordMode, handleWordModeChange,
    startWordModeFront, setStartWordModeFront,
    startWordModeBack, setStartWordModeBack,
    startWordThemeFront, setStartWordThemeFront,
    startWordThemeBack, setStartWordThemeBack,
    winnerPicks, setWinnerPicks,
    error,

    // Hole updaters
    updateHolePar,
    updateHoleWord,
    updateHoleStartWord,
    updateHoleConstraint,

    // Submit
    handleSubmit,
  };
}
