import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { HoleConfig, HolePar, ThemeOption, GameVisibility, StartWordMode, WordMode } from '../types';
import { getDisplayName } from '../utils/gameLogic';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'golf', label: 'Golf' },
  { value: 'sports', label: 'Sports' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food' },
  { value: 'animals', label: 'Animals' },
  { value: 'random', label: 'Random' },
];

function createDefaultHoles(): HoleConfig[] {
  return Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: 4 as HolePar,
  }));
}

function createClassicHoles(): HoleConfig[] {
  return Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: 4 as HolePar,
  }));
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, allUsers } = useAuth();
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
  const [error, setError] = useState('');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const otherUsers = allUsers.filter(u => u.id !== user.id);

  const toggleInvite = (userId: string) => {
    setInvitedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleWordModeChange = (mode: WordMode) => {
    setWordMode(mode);
    if (mode === 'classic') {
      setHoles(createClassicHoles());
    } else {
      setHoles(createDefaultHoles());
    }
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
      },
    });

    navigate(`/game/${game.id}`);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h2 className="fw-bold mb-4" style={{ color: 'var(--wl-green-dark)' }}>
            Create New Game
          </h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Basic Settings */}
            <div className="card game-card mb-4">
              <div className="card-header">Game Settings</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Game Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={gameName}
                    onChange={e => setGameName(e.target.value)}
                    placeholder="e.g., Sunday Round with Friends"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Visibility</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="visibility"
                        id="visPublic"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                      />
                      <label className="form-check-label" htmlFor="visPublic">
                        Public - Anyone can join
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="visibility"
                        id="visPrivate"
                        checked={visibility === 'private'}
                        onChange={() => setVisibility('private')}
                      />
                      <label className="form-check-label" htmlFor="visPrivate">
                        Private - Invite only
                      </label>
                    </div>
                  </div>
                </div>

                {visibility === 'private' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Game Password (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Users can join with this password"
                      />
                      <div className="form-text">Leave blank for invite-only access</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Invite Players</label>
                      {otherUsers.length === 0 ? (
                        <p className="text-muted small">No other users registered yet.</p>
                      ) : (
                        <div className="row g-2">
                          {otherUsers.map(u => (
                            <div key={u.id} className="col-sm-6 col-md-4">
                              <div
                                className={`invite-player-card border rounded p-2 d-flex align-items-center gap-2 ${invitedIds.includes(u.id) ? 'selected border-success' : ''}`}
                                onClick={() => toggleInvite(u.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={invitedIds.includes(u.id)}
                                  readOnly
                                />
                                <span className="small">
                                  {getDisplayName(u.firstName, u.lastName, u.nickname)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hole Configuration */}
            <div className="card game-card mb-4">
              <div className="card-header">Hole Configuration</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Word Source</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div
                        className={`p-3 border rounded config-panel h-100 ${wordMode === 'classic' ? 'border-success' : ''}`}
                        onClick={() => handleWordModeChange('classic')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="wordMode"
                            id="modeClassic"
                            checked={wordMode === 'classic'}
                            onChange={() => handleWordModeChange('classic')}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="modeClassic">
                            Classic Wordle
                          </label>
                        </div>
                        <div className="form-text mt-1">
                          Uses the official daily Wordle word from the NYT Wordle API.
                          All holes are Par 4 (5-letter words, 6 guesses).
                          Each hole uses the Wordle word of the day it unlocks.
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        className={`p-3 border rounded config-panel h-100 ${wordMode === 'custom' ? 'border-success' : ''}`}
                        onClick={() => handleWordModeChange('custom')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="wordMode"
                            id="modeCustom"
                            checked={wordMode === 'custom'}
                            onChange={() => handleWordModeChange('custom')}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="modeCustom">
                            Customize Holes
                          </label>
                        </div>
                        <div className="form-text mt-1">
                          Words are generated from themed categories. Customize par types
                          (Par 3/4/5 for 4/5/6-letter words), themes, and start words.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classic Wordle info */}
                {wordMode === 'classic' && (
                  <div className="alert alert-info small mb-3">
                    Each hole will use the official Wordle word for the day it unlocks.
                    Hole 1 uses today's word, Hole 2 uses tomorrow's, and so on.
                    All 18 holes are Par 4 (5-letter words, 6 guesses).
                  </div>
                )}

                {/* Start Word Settings - available for both modes */}
                <div className="mb-3 p-3 border rounded config-panel">
                  <label className="form-label fw-semibold">Start Word (Forced First Guess)</label>
                  <div className="form-text mb-3">
                    Choose how the first guess is determined for each nine. Players will have this word
                    automatically played as their opening guess. You can configure the front 9 and back 9 separately.
                  </div>

                  <div className="row g-3">
                    {/* Front 9 Start Word */}
                    <div className="col-md-6">
                      <div className="p-2 border rounded">
                        <label className="form-label fw-semibold">Front 9 (Holes 1-9)</label>
                        <div className="d-flex flex-column gap-1">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeFront"
                              id="swFrontNone"
                              checked={startWordModeFront === 'none'}
                              onChange={() => setStartWordModeFront('none')}
                            />
                            <label className="form-check-label" htmlFor="swFrontNone">
                              None (players choose)
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeFront"
                              id="swFrontTheme"
                              checked={startWordModeFront === 'theme'}
                              onChange={() => setStartWordModeFront('theme')}
                            />
                            <label className="form-check-label" htmlFor="swFrontTheme">
                              From category
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeFront"
                              id="swFrontCustom"
                              checked={startWordModeFront === 'custom'}
                              onChange={() => setStartWordModeFront('custom')}
                            />
                            <label className="form-check-label" htmlFor="swFrontCustom">
                              Custom (per hole)
                            </label>
                          </div>
                        </div>
                        {startWordModeFront === 'theme' && (
                          <div className="mt-2">
                            <select
                              className="form-select form-select-sm"
                              value={startWordThemeFront}
                              onChange={e => setStartWordThemeFront(e.target.value as ThemeOption)}
                            >
                              {THEME_OPTIONS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back 9 Start Word */}
                    <div className="col-md-6">
                      <div className="p-2 border rounded">
                        <label className="form-label fw-semibold">Back 9 (Holes 10-18)</label>
                        <div className="d-flex flex-column gap-1">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeBack"
                              id="swBackNone"
                              checked={startWordModeBack === 'none'}
                              onChange={() => setStartWordModeBack('none')}
                            />
                            <label className="form-check-label" htmlFor="swBackNone">
                              None (players choose)
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeBack"
                              id="swBackTheme"
                              checked={startWordModeBack === 'theme'}
                              onChange={() => setStartWordModeBack('theme')}
                            />
                            <label className="form-check-label" htmlFor="swBackTheme">
                              From category
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="startWordModeBack"
                              id="swBackCustom"
                              checked={startWordModeBack === 'custom'}
                              onChange={() => setStartWordModeBack('custom')}
                            />
                            <label className="form-check-label" htmlFor="swBackCustom">
                              Custom (per hole)
                            </label>
                          </div>
                        </div>
                        {startWordModeBack === 'theme' && (
                          <div className="mt-2">
                            <select
                              className="form-select form-select-sm"
                              value={startWordThemeBack}
                              onChange={e => setStartWordThemeBack(e.target.value as ThemeOption)}
                            >
                              {THEME_OPTIONS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-Hole Settings - available for both modes */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <label className="form-label fw-semibold mb-0">Per-Hole Settings</label>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide Details' : 'Customize Holes'}
                  </button>
                </div>

                {showAdvanced && (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr className="table-dark">
                          <th>Hole</th>
                          <th>Par</th>
                          <th>Word Length</th>
                          <th>Guesses</th>
                          {wordMode === 'custom' && <th>Custom Word</th>}
                          {(startWordModeFront === 'custom' || startWordModeBack === 'custom') && <th>Start Word</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {holes.map(hole => {
                          const wordLen = hole.par === 3 ? 4 : hole.par === 5 ? 6 : 5;
                          const guesses = hole.par === 3 ? 5 : hole.par === 5 ? 7 : 6;
                          return (
                            <tr key={hole.holeNumber} className={hole.holeNumber === 10 ? 'table-secondary' : ''}>
                              <td className="fw-semibold">
                                {hole.holeNumber}
                                {hole.holeNumber === 1 && <small className="text-muted ms-1">(Front)</small>}
                                {hole.holeNumber === 10 && <small className="text-muted ms-1">(Back)</small>}
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: '70px' }}
                                  value={hole.par}
                                  onChange={e => updateHolePar(hole.holeNumber, Number(e.target.value) as HolePar)}
                                  disabled={wordMode === 'classic'}
                                >
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                  <option value={5}>5</option>
                                </select>
                              </td>
                              <td>{wordLen} letters</td>
                              <td>{guesses}</td>
                              {wordMode === 'custom' && (
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    style={{ width: '100px' }}
                                    maxLength={wordLen}
                                    value={hole.customWord || ''}
                                    onChange={e => updateHoleWord(hole.holeNumber, e.target.value)}
                                    placeholder="Optional"
                                  />
                                </td>
                              )}
                              {(startWordModeFront === 'custom' || startWordModeBack === 'custom') && (
                                <td>
                                  {((hole.holeNumber <= 9 && startWordModeFront === 'custom') ||
                                    (hole.holeNumber > 9 && startWordModeBack === 'custom')) ? (
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      style={{ width: '100px' }}
                                      maxLength={wordLen}
                                      value={hole.customStartWord || ''}
                                      onChange={e => updateHoleStartWord(hole.holeNumber, e.target.value)}
                                      placeholder="Required"
                                    />
                                  ) : (
                                    <span className="text-muted small">-</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!showAdvanced && (
                  <div className="alert alert-info small mb-0">
                    {wordMode === 'classic' ? (
                      <>
                        All 18 holes are Par 4 (5-letter words, 6 guesses).
                        {(startWordModeFront === 'custom' || startWordModeBack === 'custom') && (
                          <> Click "Customize Holes" to enter custom start words.</>
                        )}
                      </>
                    ) : (
                      <>
                        All 18 holes default to Par 4 (5-letter words, 6 guesses).
                        Click "Customize Holes" to change individual holes to Par 3 or Par 5,
                        or to set custom target words for specific holes.
                        {(startWordModeFront === 'custom' || startWordModeBack === 'custom') && (
                          <> You must expand this section to enter custom start words.</>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Schedule Info */}
            <div className="card game-card mb-4">
              <div className="card-header">Daily Schedule</div>
              <div className="card-body">
                <div className="alert alert-info small mb-0">
                  Each hole unlocks one per day at 12:00 AM local time. Hole 1 is available on the day
                  the game is created, Hole 2 on the next day, and so on through all 18 holes.
                  Holes can only be played on their designated day.
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success btn-lg px-4">
                Create Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
