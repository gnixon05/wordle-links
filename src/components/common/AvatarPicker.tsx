import { AvatarChoice } from '../../types';
import { AVATAR_OPTIONS, AvatarOption } from '../../data/avatars';

interface AvatarPickerProps {
  selected: AvatarChoice;
  onSelect: (choice: AvatarChoice) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const golfballs = AVATAR_OPTIONS.filter(a => a.category === 'golfball');
  const penguins = AVATAR_OPTIONS.filter(a => a.category === 'penguin');

  const isSelected = (opt: AvatarOption) =>
    selected.category === opt.category && selected.variant === opt.variant;

  return (
    <div>
      <h6 className="text-muted mb-2">Golf Balls</h6>
      <div className="avatar-picker mb-3">
        {golfballs.map(opt => (
          <div
            key={`${opt.category}-${opt.variant}`}
            className={`avatar-option ${isSelected(opt) ? 'selected' : ''}`}
            onClick={() => onSelect({ category: opt.category, variant: opt.variant })}
          >
            <div className="avatar-emoji">{opt.emoji}</div>
            <div className="avatar-label">{opt.label}</div>
          </div>
        ))}
      </div>

      <h6 className="text-muted mb-2">Penguins</h6>
      <div className="avatar-picker">
        {penguins.map(opt => (
          <div
            key={`${opt.category}-${opt.variant}`}
            className={`avatar-option ${isSelected(opt) ? 'selected' : ''}`}
            onClick={() => onSelect({ category: opt.category, variant: opt.variant })}
          >
            <div className="avatar-emoji">{opt.emoji}</div>
            <div className="avatar-label">{opt.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
