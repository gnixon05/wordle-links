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
        holes,
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
