import { useState } from 'react';
import { WordleImportedStats } from '../../types';
import { getWordleImportedStats, saveWordleImportedStats, clearWordleImportedStats } from '../../utils/storage';

interface WordleStatsImportProps {
  userId: string;
  onStatsUpdated: () => void;
}

export default function WordleStatsImport({ userId, onStatsUpdated }: WordleStatsImportProps) {
  const existing = getWordleImportedStats(userId);
  const [mode, setMode] = useState<'view' | 'manual' | 'json'>('view');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual entry fields
  const [gamesPlayed, setGamesPlayed] = useState(existing?.gamesPlayed?.toString() || '');
  const [gamesWon, setGamesWon] = useState(existing?.gamesWon?.toString() || '');
  const [currentStreak, setCurrentStreak] = useState(existing?.currentStreak?.toString() || '');
  const [maxStreak, setMaxStreak] = useState(existing?.maxStreak?.toString() || '');
  const [dist1, setDist1] = useState(existing?.guessDistribution?.['1']?.toString() || '0');
  const [dist2, setDist2] = useState(existing?.guessDistribution?.['2']?.toString() || '0');
  const [dist3, setDist3] = useState(existing?.guessDistribution?.['3']?.toString() || '0');
  const [dist4, setDist4] = useState(existing?.guessDistribution?.['4']?.toString() || '0');
  const [dist5, setDist5] = useState(existing?.guessDistribution?.['5']?.toString() || '0');
  const [dist6, setDist6] = useState(existing?.guessDistribution?.['6']?.toString() || '0');

  // JSON paste field
  const [jsonInput, setJsonInput] = useState('');

  const handleManualSave = () => {
    setError('');
    const played = parseInt(gamesPlayed);
    const won = parseInt(gamesWon);
    const streak = parseInt(currentStreak);
    const max = parseInt(maxStreak);

    if (isNaN(played) || played < 0) { setError('Games played must be a non-negative number.'); return; }
    if (isNaN(won) || won < 0) { setError('Games won must be a non-negative number.'); return; }
    if (won > played) { setError('Games won cannot exceed games played.'); return; }
    if (isNaN(streak) || streak < 0) { setError('Current streak must be a non-negative number.'); return; }
    if (isNaN(max) || max < 0) { setError('Max streak must be a non-negative number.'); return; }
    if (streak > max) { setError('Current streak cannot exceed max streak.'); return; }

    const distribution: Record<string, number> = {
      '1': parseInt(dist1) || 0,
      '2': parseInt(dist2) || 0,
      '3': parseInt(dist3) || 0,
      '4': parseInt(dist4) || 0,
      '5': parseInt(dist5) || 0,
      '6': parseInt(dist6) || 0,
      'fail': played - won,
    };

    const stats: WordleImportedStats = {
      gamesPlayed: played,
      gamesWon: won,
      currentStreak: streak,
      maxStreak: max,
      guessDistribution: distribution,
      importedAt: new Date().toISOString(),
      source: 'manual',
    };

    saveWordleImportedStats(userId, stats);
    setSuccess('Wordle stats imported successfully!');
    setMode('view');
    onStatsUpdated();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleJsonImport = () => {
    setError('');
    try {
      const data = JSON.parse(jsonInput);

      // Support NYT Wordle statistics format
      const stats: WordleImportedStats = {
        gamesPlayed: data.gamesPlayed ?? 0,
        gamesWon: data.gamesWon ?? 0,
        currentStreak: data.currentStreak ?? 0,
        maxStreak: data.maxStreak ?? 0,
        guessDistribution: data.guesses ?? data.guessDistribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, 'fail': 0 },
        importedAt: new Date().toISOString(),
        source: 'json',
      };

      if (stats.gamesPlayed < 0 || stats.gamesWon < 0) {
        setError('Invalid stats data: values must be non-negative.');
        return;
      }

      saveWordleImportedStats(userId, stats);
      setSuccess('Wordle stats imported from JSON successfully!');
      setJsonInput('');
      setMode('view');
      onStatsUpdated();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Invalid JSON. Please paste valid JSON from the Wordle statistics.');
    }
  };

  const handleClear = () => {
    clearWordleImportedStats(userId);
    setGamesPlayed('');
    setGamesWon('');
    setCurrentStreak('');
    setMaxStreak('');
    setDist1('0');
    setDist2('0');
    setDist3('0');
    setDist4('0');
    setDist5('0');
    setDist6('0');
    setSuccess('Imported Wordle stats cleared.');
    onStatsUpdated();
    setTimeout(() => setSuccess(''), 3000);
  };

  const winPct = existing && existing.gamesPlayed > 0
    ? Math.round((existing.gamesWon / existing.gamesPlayed) * 100)
    : 0;

  const maxDist = existing
    ? Math.max(1, ...Object.entries(existing.guessDistribution)
        .filter(([k]) => k !== 'fail')
        .map(([, v]) => v))
    : 1;

  return (
    <div className="card game-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>NYT Wordle Stats</span>
        {existing && mode === 'view' && (
          <div className="d-flex gap-1">
            <button className="btn btn-outline-success btn-sm py-0 px-2" onClick={() => setMode('manual')}>
              Edit
            </button>
            <button className="btn btn-outline-danger btn-sm py-0 px-2" onClick={handleClear}>
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        {success && <div className="alert alert-success py-1 small">{success}</div>}
        {error && <div className="alert alert-danger py-1 small">{error}</div>}

        {mode === 'view' && !existing && (
          <div className="text-center">
            <p className="text-muted small mb-3">
              Import your NYT Wordle stats to track your overall Wordle history alongside your Wordle Tour games.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-success btn-sm" onClick={() => setMode('manual')}>
                Enter Manually
              </button>
              <button className="btn btn-outline-success btn-sm" onClick={() => setMode('json')}>
                Paste JSON
              </button>
            </div>
            <div className="mt-3">
              <details className="text-start">
                <summary className="text-muted small" style={{ cursor: 'pointer' }}>How to export JSON from Wordle</summary>
                <ol className="text-muted small mt-2">
                  <li>Open <strong>nytimes.com/games/wordle</strong> in your browser</li>
                  <li>Open browser Developer Tools (F12 or Cmd+Shift+I)</li>
                  <li>Go to the Console tab</li>
                  <li>Paste: <code>copy(localStorage.getItem('nyt-wordle-statistics'))</code></li>
                  <li>Press Enter - the stats JSON is now on your clipboard</li>
                  <li>Come back here and paste it in the JSON field</li>
                </ol>
              </details>
            </div>
          </div>
        )}

        {mode === 'view' && existing && (
          <>
            <div className="row text-center mb-3">
              <div className="col-3">
                <div className="fw-bold fs-5">{existing.gamesPlayed}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Played</div>
              </div>
              <div className="col-3">
                <div className="fw-bold fs-5">{winPct}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Win %</div>
              </div>
              <div className="col-3">
                <div className="fw-bold fs-5">{existing.currentStreak}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Current Streak</div>
              </div>
              <div className="col-3">
                <div className="fw-bold fs-5">{existing.maxStreak}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Max Streak</div>
              </div>
            </div>

            <div className="small fw-semibold mb-2">Guess Distribution</div>
            {['1', '2', '3', '4', '5', '6'].map(n => {
              const count = existing.guessDistribution[n] || 0;
              const pct = Math.max(8, (count / maxDist) * 100);
              return (
                <div key={n} className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-muted" style={{ width: '12px', fontSize: '0.75rem' }}>{n}</span>
                  <div
                    className="text-white text-end px-2"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: 'var(--wl-green, #538d4e)',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      minWidth: '20px',
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}

            <div className="text-muted text-end mt-2" style={{ fontSize: '0.65rem' }}>
              Imported {new Date(existing.importedAt).toLocaleDateString()} via {existing.source === 'json' ? 'JSON paste' : 'manual entry'}
            </div>
          </>
        )}

        {mode === 'manual' && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small">Games Played</label>
                <input type="number" className="form-control form-control-sm" value={gamesPlayed}
                  onChange={e => setGamesPlayed(e.target.value)} min="0" />
              </div>
              <div className="col-6">
                <label className="form-label small">Games Won</label>
                <input type="number" className="form-control form-control-sm" value={gamesWon}
                  onChange={e => setGamesWon(e.target.value)} min="0" />
              </div>
              <div className="col-6">
                <label className="form-label small">Current Streak</label>
                <input type="number" className="form-control form-control-sm" value={currentStreak}
                  onChange={e => setCurrentStreak(e.target.value)} min="0" />
              </div>
              <div className="col-6">
                <label className="form-label small">Max Streak</label>
                <input type="number" className="form-control form-control-sm" value={maxStreak}
                  onChange={e => setMaxStreak(e.target.value)} min="0" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Guess Distribution</label>
              <div className="row g-1">
                {[
                  { label: '1', val: dist1, set: setDist1 },
                  { label: '2', val: dist2, set: setDist2 },
                  { label: '3', val: dist3, set: setDist3 },
                  { label: '4', val: dist4, set: setDist4 },
                  { label: '5', val: dist5, set: setDist5 },
                  { label: '6', val: dist6, set: setDist6 },
                ].map(({ label, val, set }) => (
                  <div key={label} className="col-4 col-sm-2">
                    <label className="form-label small text-muted mb-0">Guess {label}</label>
                    <input type="number" className="form-control form-control-sm" value={val}
                      onChange={e => set(e.target.value)} min="0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={handleManualSave}>Save</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => { setMode('view'); setError(''); }}>Cancel</button>
            </div>
          </>
        )}

        {mode === 'json' && (
          <>
            <p className="text-muted small">
              Paste the JSON from your Wordle statistics. See instructions below for how to get it.
            </p>
            <textarea
              className="form-control form-control-sm mb-2"
              rows={5}
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder='{"gamesPlayed":100,"gamesWon":95,"currentStreak":5,"maxStreak":20,"guesses":{"1":2,"2":10,"3":25,"4":35,"5":18,"6":5,"fail":5}}'
            />
            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={handleJsonImport} disabled={!jsonInput.trim()}>
                Import
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => { setMode('view'); setError(''); }}>Cancel</button>
            </div>

            <details className="text-start mt-3">
              <summary className="text-muted small" style={{ cursor: 'pointer' }}>How to export from NYT Wordle</summary>
              <ol className="text-muted small mt-2">
                <li>Open <strong>nytimes.com/games/wordle</strong> in your browser</li>
                <li>Open browser Developer Tools (F12 or Cmd+Shift+I)</li>
                <li>Go to the Console tab</li>
                <li>Paste: <code>copy(localStorage.getItem('nyt-wordle-statistics'))</code></li>
                <li>Press Enter - the stats JSON is now on your clipboard</li>
                <li>Come back here and paste it in the field above</li>
              </ol>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
