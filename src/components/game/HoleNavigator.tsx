import { HoleConfig, HoleResult } from '../../types';
import { getHoleAvailability, formatHoleDate } from '../../utils/gameLogic';

interface HoleNavigatorProps {
  holes: HoleConfig[];
  currentHole: number;
  completedHoles: HoleResult[];
  onSelectHole: (holeNumber: number) => void;
  startDate: string;
}

export default function HoleNavigator({ holes, currentHole, completedHoles, onSelectHole, startDate }: HoleNavigatorProps) {
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
          const availability = getHoleAvailability(startDate, hole.holeNumber);
          const isLocked = availability === 'locked';
          const isPast = availability === 'past' && !isCompleted;
          const dateLabel = formatHoleDate(startDate, hole.holeNumber);

          const classes = [
            'hole-btn',
            isCompleted ? 'completed' : '',
            isCurrent ? 'active current' : '',
            isLocked ? 'locked' : '',
            isPast ? 'past' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={hole.holeNumber}
              className={classes}
              onClick={() => {
                if (!isLocked && !isPast) {
                  onSelectHole(hole.holeNumber);
                }
              }}
              disabled={isLocked || isPast}
              title={
                isLocked
                  ? `Hole ${hole.holeNumber} - Unlocks ${dateLabel}`
                  : isPast
                    ? `Hole ${hole.holeNumber} - Expired (was ${dateLabel})`
                    : `Hole ${hole.holeNumber} (Par ${hole.par}) - ${dateLabel}`
              }
            >
              {isLocked ? '🔒' : isPast ? '—' : hole.holeNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
