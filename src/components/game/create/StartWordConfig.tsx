import { StartWordMode, ThemeOption } from '../../../types';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'golf', label: 'Golf' },
  { value: 'sports', label: 'Sports' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food' },
  { value: 'animals', label: 'Animals' },
  { value: 'random', label: 'Random' },
];

interface NineConfigProps {
  label: string;
  holeRange: string;
  namePrefix: string;
  mode: StartWordMode;
  onModeChange: (m: StartWordMode) => void;
  theme: ThemeOption;
  onThemeChange: (t: ThemeOption) => void;
}

function NineConfig({ label, holeRange, namePrefix, mode, onModeChange, theme, onThemeChange }: NineConfigProps) {
  const modes: { value: StartWordMode; label: string }[] = [
    { value: 'none', label: 'None (players choose)' },
    { value: 'theme', label: 'From category' },
    { value: 'custom', label: 'Custom (per hole)' },
  ];

  return (
    <div className="col-md-6">
      <div className="p-2 border rounded">
        <label className="form-label fw-semibold">{label} ({holeRange})</label>
        <div className="d-flex flex-column gap-1">
          {modes.map(m => (
            <div key={m.value} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name={`startWordMode-${namePrefix}`}
                id={`sw-${namePrefix}-${m.value}`}
                checked={mode === m.value}
                onChange={() => onModeChange(m.value)}
              />
              <label className="form-check-label" htmlFor={`sw-${namePrefix}-${m.value}`}>
                {m.label}
              </label>
            </div>
          ))}
        </div>
        {mode === 'theme' && (
          <div className="mt-2">
            <select
              className="form-select form-select-sm"
              value={theme}
              onChange={e => onThemeChange(e.target.value as ThemeOption)}
            >
              {THEME_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  startWordModeFront: StartWordMode;
  onFrontModeChange: (m: StartWordMode) => void;
  startWordThemeFront: ThemeOption;
  onFrontThemeChange: (t: ThemeOption) => void;
  startWordModeBack: StartWordMode;
  onBackModeChange: (m: StartWordMode) => void;
  startWordThemeBack: ThemeOption;
  onBackThemeChange: (t: ThemeOption) => void;
}

export default function StartWordConfig(props: Props) {
  return (
    <div className="mb-3 p-3 border rounded config-panel">
      <label className="form-label fw-semibold">Start Word (Forced First Guess)</label>
      <div className="form-text mb-3">
        Choose how the first guess is determined for each nine. Players will have this word
        automatically played as their opening guess. You can configure the front 9 and back 9 separately.
      </div>
      <div className="row g-3">
        <NineConfig
          label="Front 9"
          holeRange="Holes 1-9"
          namePrefix="front"
          mode={props.startWordModeFront}
          onModeChange={props.onFrontModeChange}
          theme={props.startWordThemeFront}
          onThemeChange={props.onFrontThemeChange}
        />
        <NineConfig
          label="Back 9"
          holeRange="Holes 10-18"
          namePrefix="back"
          mode={props.startWordModeBack}
          onModeChange={props.onBackModeChange}
          theme={props.startWordThemeBack}
          onThemeChange={props.onBackThemeChange}
        />
      </div>
    </div>
  );
}
