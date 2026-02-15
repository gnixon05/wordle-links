import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { HoleConfig, HolePar, ThemeOption, GameVisibility, StartWordMode } from '../types';
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

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, allUsers } = useAuth();
  const { createGame } = useGame();

  const [gameName, setGameName] = useState('');
  const [visibility, setVisibility] = useState<GameVisibility>('public');
  const [password, setPassword] = useState('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [frontTheme, setFrontTheme] = useState<ThemeOption>('golf');
  const [backTheme, setBackTheme] = useState<ThemeOption>('golf');
  const [holes, setHoles] = useState<HoleConfig[]>(createDefaultHoles());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordMode, setWordMode] = useState<'theme' | 'custom' | 'mixed'>('theme');
  const [startWordMode, setStartWordMode] = useState<StartWordMode>('none');
  const [startWordTheme, setStartWordTheme] = useState<ThemeOption>('golf');
  const [error, setError] = useState('');

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const otherUsers = allUsers.filter(u => u.id !== user.id);

  const toggleInvite = (userId: string) => {
    setInvitedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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

    // Validate custom words if in custom mode
    if (wordMode === 'custom') {
      for (const hole of holes) {
        if (!hole.customWord) {
          setError(`Please enter a word for Hole ${hole.holeNumber} or switch to theme mode.`);
          return;
        }
        const expectedLength = hole.par === 3 ? 4 : hole.par === 5 ? 6 : 5;
        if (hole.customWord.length !== expectedLength) {
          setError(`Hole ${hole.holeNumber} word must be ${expectedLength} letters (Par ${hole.par}).`);
          return;
        }
      }
    }

    // Validate custom start words if in custom start word mode
    if (startWordMode === 'custom') {
      for (const hole of holes) {
        if (!hole.customStartWord) {
          setError(`Please enter a start word for Hole ${hole.holeNumber} or switch start word to theme mode.`);
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
        frontNineTheme: frontTheme,
        backNineTheme: backTheme,
        startWordMode,
        startWordTheme: startWordMode === 'theme' ? startWordTheme : undefined,
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
                                className={`border rounded p-2 d-flex align-items-center gap-2 cursor-pointer ${invitedIds.includes(u.id) ? 'border-success bg-light' : ''}`}
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

            {/* Theme & Word Settings */}
            <div className="card game-card mb-4">
              <div className="card-header">Round Configuration</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Word Mode</label>
                  <div className="d-flex gap-3 flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="wordMode"
                        id="modeTheme"
                        checked={wordMode === 'theme'}
                        onChange={() => setWordMode('theme')}
                      />
                      <label className="form-check-label" htmlFor="modeTheme">
                        Theme-based (auto-generate words)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="wordMode"
                        id="modeCustom"
                        checked={wordMode === 'custom'}
                        onChange={() => setWordMode('custom')}
                      />
                      <label className="form-check-label" htmlFor="modeCustom">
                        Custom (specify all 18 words)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="wordMode"
                        id="modeMixed"
                        checked={wordMode === 'mixed'}
                        onChange={() => setWordMode('mixed')}
                      />
                      <label className="form-check-label" htmlFor="modeMixed">
                        Mixed (theme for some, custom for others)
                      </label>
                    </div>
                  </div>
                </div>

                {(wordMode === 'theme' || wordMode === 'mixed') && (
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold">Front 9 Theme</label>
                      <select
                        className="form-select"
                        value={frontTheme}
                        onChange={e => setFrontTheme(e.target.value as ThemeOption)}
                      >
                        {THEME_OPTIONS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold">Back 9 Theme</label>
                      <select
                        className="form-select"
                        value={backTheme}
                        onChange={e => setBackTheme(e.target.value as ThemeOption)}
                      >
                        {THEME_OPTIONS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Start Word Settings */}
                <div className="mb-3 p-3 border rounded bg-light">
                  <label className="form-label fw-semibold">Start Word (Forced First Guess)</label>
                  <div className="form-text mb-2">
                    Choose how the first guess is determined for each hole. Players will have this word
                    automatically played as their opening guess.
                  </div>
                  <div className="d-flex gap-3 flex-wrap">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="startWordMode"
                        id="swNone"
                        checked={startWordMode === 'none'}
                        onChange={() => setStartWordMode('none')}
                      />
                      <label className="form-check-label" htmlFor="swNone">
                        None (players choose their own first guess)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="startWordMode"
                        id="swTheme"
                        checked={startWordMode === 'theme'}
                        onChange={() => setStartWordMode('theme')}
                      />
                      <label className="form-check-label" htmlFor="swTheme">
                        From category (auto-generate from a theme)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="startWordMode"
                        id="swCustom"
                        checked={startWordMode === 'custom'}
                        onChange={() => setStartWordMode('custom')}
                      />
                      <label className="form-check-label" htmlFor="swCustom">
                        Custom (specify a start word for each hole)
                      </label>
                    </div>
                  </div>

                  {startWordMode === 'theme' && (
                    <div className="mt-3" style={{ maxWidth: '300px' }}>
                      <label className="form-label fw-semibold">Start Word Category</label>
                      <select
                        className="form-select"
                        value={startWordTheme}
                        onChange={e => setStartWordTheme(e.target.value as ThemeOption)}
                      >
                        {THEME_OPTIONS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <div className="form-text">
                        A word from this category will be auto-played as the first guess on each hole.
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <label className="form-label fw-semibold mb-0">Hole Configuration</label>
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
                          {(wordMode === 'custom' || wordMode === 'mixed') && <th>Custom Word</th>}
                          {startWordMode === 'custom' && <th>Start Word</th>}
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
                                >
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                  <option value={5}>5</option>
                                </select>
                              </td>
                              <td>{wordLen} letters</td>
                              <td>{guesses}</td>
                              {(wordMode === 'custom' || wordMode === 'mixed') && (
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    style={{ width: '100px' }}
                                    maxLength={wordLen}
                                    value={hole.customWord || ''}
                                    onChange={e => updateHoleWord(hole.holeNumber, e.target.value)}
                                    placeholder={wordMode === 'mixed' ? 'Optional' : 'Required'}
                                  />
                                </td>
                              )}
                              {startWordMode === 'custom' && (
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    style={{ width: '100px' }}
                                    maxLength={wordLen}
                                    value={hole.customStartWord || ''}
                                    onChange={e => updateHoleStartWord(hole.holeNumber, e.target.value)}
                                    placeholder="Required"
                                  />
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
                    All 18 holes default to Par 4 (5-letter words, 6 guesses).
                    Click "Customize Holes" to change individual holes to Par 3 or Par 5.
                    {startWordMode === 'custom' && (
                      <> You must expand this section to enter custom start words.</>
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
