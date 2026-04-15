import { useState } from 'react';
import { HoleConfig, HolePar, WordMode, StartWordMode, WordConstraints } from '../../../types';

interface Props {
  holes: HoleConfig[];
  wordMode: WordMode;
  winnerPicks: boolean;
  startWordModeFront: StartWordMode;
  startWordModeBack: StartWordMode;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onUpdatePar: (holeNumber: number, par: HolePar) => void;
  onUpdateWord: (holeNumber: number, word: string) => void;
  onUpdateStartWord: (holeNumber: number, word: string) => void;
  onUpdateConstraint: (holeNumber: number, field: keyof WordConstraints, value: string) => void;
}

function getWordLength(par: HolePar): number {
  return par === 3 ? 4 : par === 5 ? 6 : 5;
}

function getGuesses(par: HolePar): number {
  return par === 3 ? 5 : par === 5 ? 7 : 6;
}

function HoleCard({
  hole,
  wordMode,
  winnerPicks,
  startWordModeFront,
  startWordModeBack,
  isExpanded,
  onToggle,
  onUpdatePar,
  onUpdateWord,
  onUpdateStartWord,
  onUpdateConstraint,
}: {
  hole: HoleConfig;
  wordMode: WordMode;
  winnerPicks: boolean;
  startWordModeFront: StartWordMode;
  startWordModeBack: StartWordMode;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdatePar: (par: HolePar) => void;
  onUpdateWord: (word: string) => void;
  onUpdateStartWord: (word: string) => void;
  onUpdateConstraint: (field: keyof WordConstraints, value: string) => void;
}) {
  const wordLen = getWordLength(hole.par);
  const guesses = getGuesses(hole.par);
  const isFirstOfNine = hole.holeNumber === 1 || hole.holeNumber === 10;
  const winnerPicksHidesConstraint = winnerPicks && !isFirstOfNine;
  const hasCustomWord = !!hole.customWord;
  const isFront = hole.holeNumber <= 9;
  const nineMode = isFront ? startWordModeFront : startWordModeBack;
  // When Winner Picks is on, only the first hole of each nine needs an
  // initial start word — the hole winner's rule determines the rest.
  const showStartWordInput = nineMode === 'custom' && (!winnerPicks || isFirstOfNine);
  const hasCustomStartWord = showStartWordInput; // custom per-hole start word makes constraints obsolete
  const showConstraints = !winnerPicksHidesConstraint && !hasCustomWord && !hasCustomStartWord;
  const showCustomWord = wordMode === 'custom' && (!winnerPicks || isFirstOfNine);

  const nineLabel = hole.holeNumber === 1 ? 'Front 9' : hole.holeNumber === 10 ? 'Back 9' : '';

  return (
    <div className={`hole-settings-card ${isExpanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="hole-settings-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="hole-settings-header-left">
          <span className="hole-number">#{hole.holeNumber}</span>
          {nineLabel && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>{nineLabel}</span>}
        </div>
        <div className="hole-settings-header-summary">
          <span className="badge bg-success">Par {hole.par}</span>
          <span className="text-muted small ms-2">{wordLen} letters, {guesses} guesses</span>
        </div>
        <span className={`hole-settings-chevron ${isExpanded ? 'open' : ''}`}>&#9662;</span>
      </button>

      {isExpanded && (
        <div className="hole-settings-body">
          <div className="row g-3">
            {/* Par */}
            <div className="col-6 col-sm-4">
              <label className="form-label small fw-semibold">Par</label>
              <select
                className="form-select form-select-sm"
                value={hole.par}
                onChange={e => onUpdatePar(Number(e.target.value) as HolePar)}
                disabled={wordMode === 'classic'}
              >
                <option value={3}>Par 3 (4 letters)</option>
                <option value={4}>Par 4 (5 letters)</option>
                <option value={5}>Par 5 (6 letters)</option>
              </select>
            </div>

            {/* Custom Word */}
            {showCustomWord && (
              <div className="col-6 col-sm-4">
                <label className="form-label small fw-semibold">Custom Word</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  maxLength={wordLen}
                  value={hole.customWord || ''}
                  onChange={e => onUpdateWord(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            )}

            {/* Custom Start Word */}
            {showStartWordInput && (
              <div className="col-6 col-sm-4">
                <label className="form-label small fw-semibold">Start Word</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  maxLength={wordLen}
                  value={hole.customStartWord || ''}
                  onChange={e => onUpdateStartWord(e.target.value)}
                  placeholder="Required"
                />
              </div>
            )}

            {/* Winner picks placeholder */}
            {winnerPicksHidesConstraint && (
              <div className="col-12">
                <span className="text-muted small">Start word rules set by previous hole's winner</span>
              </div>
            )}

            {/* Constraints */}
            {showConstraints && (
              <>
                <div className="col-12">
                  <hr className="my-1" />
                  <label className="form-label small fw-semibold text-muted">Start Word Rules (optional)</label>
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label small">Starts with</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={wordLen - 1}
                    value={hole.wordConstraints?.startsWith || ''}
                    onChange={e => onUpdateConstraint('startsWith', e.target.value)}
                    placeholder="e.g. TR"
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label small">Ends with</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={wordLen - 1}
                    value={hole.wordConstraints?.endsWith || ''}
                    onChange={e => onUpdateConstraint('endsWith', e.target.value)}
                    placeholder="e.g. ED"
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label small">Contains</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={wordLen}
                    value={hole.wordConstraints?.contains || ''}
                    onChange={e => onUpdateConstraint('contains', e.target.value)}
                    placeholder="e.g. AE"
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label small">Letter pool</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={26}
                    value={hole.wordConstraints?.letterPool || ''}
                    onChange={e => onUpdateConstraint('letterPool', e.target.value)}
                    placeholder="e.g. ABCDEF"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HoleSettingsPanel({
  holes,
  wordMode,
  winnerPicks,
  startWordModeFront,
  startWordModeBack,
  showAdvanced,
  onToggleAdvanced,
  onUpdatePar,
  onUpdateWord,
  onUpdateStartWord,
  onUpdateConstraint,
}: Props) {
  const [expandedHoles, setExpandedHoles] = useState<Set<number>>(new Set());

  const toggleHole = (holeNumber: number) => {
    setExpandedHoles(prev => {
      const next = new Set(prev);
      if (next.has(holeNumber)) {
        next.delete(holeNumber);
      } else {
        next.add(holeNumber);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedHoles(new Set(holes.map(h => h.holeNumber)));
  const collapseAll = () => setExpandedHoles(new Set());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label fw-semibold mb-0">Per-Hole Settings</label>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onToggleAdvanced}
        >
          {showAdvanced ? 'Hide Details' : 'Customize Holes'}
        </button>
      </div>

      {showAdvanced && (
        <>
          <div className="d-flex gap-2 mb-2">
            <button type="button" className="btn btn-link btn-sm p-0" onClick={expandAll}>
              Expand all
            </button>
            <span className="text-muted">|</span>
            <button type="button" className="btn btn-link btn-sm p-0" onClick={collapseAll}>
              Collapse all
            </button>
          </div>

          <div className="hole-settings-list">
            {holes.map(hole => (
              <HoleCard
                key={hole.holeNumber}
                hole={hole}
                wordMode={wordMode}
                winnerPicks={winnerPicks}
                startWordModeFront={startWordModeFront}
                startWordModeBack={startWordModeBack}
                isExpanded={expandedHoles.has(hole.holeNumber)}
                onToggle={() => toggleHole(hole.holeNumber)}
                onUpdatePar={par => onUpdatePar(hole.holeNumber, par)}
                onUpdateWord={word => onUpdateWord(hole.holeNumber, word)}
                onUpdateStartWord={word => onUpdateStartWord(hole.holeNumber, word)}
                onUpdateConstraint={(field, value) => onUpdateConstraint(hole.holeNumber, field, value)}
              />
            ))}
          </div>
        </>
      )}

      {!showAdvanced && (
        <div className="alert alert-info small mb-0">
          {wordMode === 'classic' ? (
            <>
              All 18 holes are Par 4 (5-letter words, 6 guesses).
              Click "Customize Holes" to set start word rules or custom start words per hole.
            </>
          ) : (
            <>
              All 18 holes default to Par 4 (5-letter words, 6 guesses).
              Click "Customize Holes" to change par, set custom words, or add start word rules.
              {winnerPicks && <> With "Winner Picks" on, only Hole 1 and 10 need initial settings &mdash; winners set the rest during play.</>}
              {(startWordModeFront === 'custom' || startWordModeBack === 'custom') && (
                <> You must expand this section to enter custom start words.</>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
