import { HoleConfig, HoleResult } from '../../types';

interface HoleNavigatorProps {
  holes: HoleConfig[];
  currentHole: number;
  completedHoles: HoleResult[];
  onSelectHole: (holeNumber: number) => void;
}

export default function HoleNavigator({ holes, currentHole, completedHoles, onSelectHole }: HoleNavigatorProps) {
  const completedNumbers = new Set(completedHoles.map(h => h.holeNumber));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted fw-bold">FRONT 9</small>
        <small className="text-muted fw-bold">BACK 9</small>
      </div>
      <div className="hole-nav">
        {holes.map((hole) => {
          const isCompleted = completedNumbers.has(hole.holeNumber);
          const isCurrent = hole.holeNumber === currentHole;
          const classes = [
            'hole-btn',
            isCompleted ? 'completed' : '',
            isCurrent ? 'active current' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={hole.holeNumber}
              className={classes}
              onClick={() => onSelectHole(hole.holeNumber)}
              title={`Hole ${hole.holeNumber} (Par ${hole.par})`}
            >
              {hole.holeNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
