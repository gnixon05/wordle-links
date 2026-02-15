import { HoleConfig, HoleResult, HolePar } from '../../types';
import { getScoreRelativeToPar } from '../../utils/gameLogic';

interface GolfScorecardProps {
  holes: HoleConfig[];
  results?: HoleResult[];
  playerName?: string;
  showAllHoles?: boolean;
}

function getScoreClass(score: number, par: HolePar): string {
  const diff = score - par;
  if (diff <= -2) return 'score-eagle';
  if (diff === -1) return 'score-birdie';
  if (diff === 0) return 'score-par';
  if (diff === 1) return 'score-bogey';
  return 'score-double-bogey';
}

export default function GolfScorecard({ holes, results = [], playerName, showAllHoles = true }: GolfScorecardProps) {
  const frontNine = holes.filter(h => h.holeNumber <= 9);
  const backNine = holes.filter(h => h.holeNumber > 9);

  const getResult = (holeNum: number) => results.find(r => r.holeNumber === holeNum);

  const renderNine = (nineHoles: HoleConfig[], label: string) => {
    const nineResults = nineHoles.map(h => getResult(h.holeNumber));
    const parTotal = nineHoles.reduce((s, h) => s + h.par, 0);
    const scoreTotal = nineResults.reduce((s, r) => s + (r?.score || 0), 0);

    return (
      <div className="scorecard mb-3">
        <table className="table table-sm table-bordered mb-0">
          <thead>
            <tr className="hole-header">
              <th>{label}</th>
              {nineHoles.map(h => (
                <th key={h.holeNumber}>{h.holeNumber}</th>
              ))}
              <th className="total-col">OUT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="par-row">
              <td><strong>Par</strong></td>
              {nineHoles.map(h => (
                <td key={h.holeNumber}>{h.par}</td>
              ))}
              <td className="total-col">{parTotal}</td>
            </tr>
            {(results.length > 0 || playerName) && (
              <tr>
                <td><strong>{playerName || 'Score'}</strong></td>
                {nineHoles.map(h => {
                  const r = getResult(h.holeNumber);
                  return (
                    <td key={h.holeNumber} className={r ? getScoreClass(r.score, h.par) : ''}>
                      {r ? r.score : '-'}
                    </td>
                  );
                })}
                <td className="total-col">{scoreTotal > 0 ? scoreTotal : '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const totalPar = holes.reduce((s, h) => s + h.par, 0);
  const totalScore = results.reduce((s, r) => s + r.score, 0);

  return (
    <div>
      {renderNine(frontNine, 'Front 9')}
      {showAllHoles && backNine.length > 0 && renderNine(backNine, 'Back 9')}

      {results.length > 0 && (
        <div className="text-center mt-2">
          <span className="badge bg-dark fs-6 px-3 py-2">
            Total: {totalScore} ({getScoreRelativeToPar(totalScore, totalPar as HolePar)})
          </span>
        </div>
      )}
    </div>
  );
}
