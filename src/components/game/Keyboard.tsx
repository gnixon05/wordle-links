import { KeyboardKey } from '../../types';

interface KeyboardProps {
  keys: KeyboardKey[];
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const ROW1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export default function Keyboard({ keys, onKeyPress, onEnter, onBackspace, disabled }: KeyboardProps) {
  const keyMap = new Map(keys.map(k => [k.key, k.status]));

  const getStatus = (letter: string) => keyMap.get(letter) || 'unused';

  const renderKey = (letter: string) => (
    <button
      key={letter}
      className={`key-btn ${getStatus(letter)}`}
      onClick={() => !disabled && onKeyPress(letter)}
      disabled={disabled}
    >
      {letter}
    </button>
  );

  return (
    <div className="keyboard">
      <div className="keyboard-row">
        {ROW1.map(renderKey)}
      </div>
      <div className="keyboard-row">
        {ROW2.map(renderKey)}
      </div>
      <div className="keyboard-row">
        <button
          className="key-btn wide unused"
          onClick={() => !disabled && onEnter()}
          disabled={disabled}
        >
          ENTER
        </button>
        {ROW3.map(renderKey)}
        <button
          className="key-btn wide unused"
          onClick={() => !disabled && onBackspace()}
          disabled={disabled}
        >
          &#9003;
        </button>
      </div>
    </div>
  );
}
