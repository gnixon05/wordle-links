import { WordMode } from '../../../types';

interface Props {
  wordMode: WordMode;
  onChange: (mode: WordMode) => void;
}

const MODES: { value: WordMode; label: string; description: string }[] = [
  {
    value: 'classic',
    label: 'Classic Wordle',
    description: 'Uses the official daily Wordle word from the NYT Wordle API. All holes are Par 4 (5-letter words, 6 guesses). Each hole uses the Wordle word of the day it unlocks.',
  },
  {
    value: 'custom',
    label: 'Customize Holes',
    description: 'Words are generated from themed categories. Customize par types (Par 3/4/5 for 4/5/6-letter words), themes, and start words.',
  },
];

export default function WordModeSelector({ wordMode, onChange }: Props) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Word Source</label>
      <div className="row g-3">
        {MODES.map(mode => (
          <div key={mode.value} className="col-md-6">
            <div
              className={`p-3 border rounded config-panel h-100 word-mode-option ${wordMode === mode.value ? 'selected border-success' : ''}`}
              onClick={() => onChange(mode.value)}
              style={{ cursor: 'pointer' }}
            >
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="wordMode"
                  id={`mode-${mode.value}`}
                  checked={wordMode === mode.value}
                  onChange={() => onChange(mode.value)}
                />
                <label className="form-check-label fw-semibold" htmlFor={`mode-${mode.value}`}>
                  {mode.label}
                </label>
              </div>
              <div className="form-text mt-1">{mode.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
