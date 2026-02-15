import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LeaderboardEntry, HolePar } from '../types';
import Avatar from '../components/common/Avatar';
import { getUsers, getGameById } from '../utils/storage';
import { getDisplayName } from '../utils/gameLogic';
import { getRoundResults } from '../utils/storage';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const leaderboard = useMemo((): LeaderboardEntry[] => {
    const users = getUsers();
    const allResults = getRoundResults();

    return users.map(u => {
      const userResults = allResults.filter(r => r.userId === u.id);
      const completedResults = userResults.filter(r => r.completedAt);

      let totalScore = 0;
      let holesPlayed = 0;
      let holesInOne = 0;
      let eagles = 0;
      let birdies = 0;
      let bestRound = Infinity;

      const gameIds = new Set(completedResults.map(r => r.gameId));

      completedResults.forEach(r => {
        totalScore += r.totalScore;
        holesPlayed += r.holes.length;

        if (r.totalScore < bestRound) bestRound = r.totalScore;

        const game = getGameById(r.gameId);
        const round = game?.rounds.find(rd => rd.roundNumber === r.roundNumber);

        r.holes.forEach(h => {
          const holePar: HolePar = round?.holes.find(rh => rh.holeNumber === h.holeNumber)?.par || 4;
          const diff = h.score - holePar;
          if (h.score === 1) holesInOne++;
          if (diff <= -2) eagles++;
          else if (diff === -1) birdies++;
        });
      });

      return {
        userId: u.id,
        displayName: getDisplayName(u.firstName, u.lastName, u.nickname),
        avatar: u.avatar,
        gamesPlayed: gameIds.size,
        roundsPlayed: completedResults.length,
        totalScore,
        averageScore: completedResults.length > 0
          ? Math.round(totalScore / completedResults.length * 10) / 10
          : 0,
        bestRoundScore: bestRound === Infinity ? 0 : bestRound,
        holesInOne,
        eagles,
        birdies,
      };
    })
    .filter(e => e.roundsPlayed > 0)
    .sort((a, b) => a.averageScore - b.averageScore);
  }, []);

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--wl-green-dark)' }}>
        <span className="me-2">&#127942;</span>Global Leaderboard
      </h2>

      {leaderboard.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">No completed rounds yet.</p>
          <p className="text-muted">Complete a round to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="card game-card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: 'var(--wl-green-dark)', color: 'white' }}>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Player</th>
                    <th className="text-center">Games</th>
                    <th className="text-center">Rounds</th>
                    <th className="text-center">Avg Score</th>
                    <th className="text-center">Best Round</th>
                    <th className="text-center d-none d-md-table-cell">HiO</th>
                    <th className="text-center d-none d-md-table-cell">Eagles</th>
                    <th className="text-center d-none d-md-table-cell">Birdies</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const isCurrentUser = entry.userId === user?.id;
                    return (
                      <tr key={entry.userId} className={isCurrentUser ? 'table-success' : ''}>
                        <td className="fw-bold">
                          {idx === 0 && <span dangerouslySetInnerHTML={{ __html: '&#127942;' }} />}
                          {idx === 1 && <span dangerouslySetInnerHTML={{ __html: '&#129352;' }} />}
                          {idx === 2 && <span dangerouslySetInnerHTML={{ __html: '&#129353;' }} />}
                          {idx > 2 && (idx + 1)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Avatar avatar={entry.avatar} size="small" />
                            <span className={`fw-semibold ${isCurrentUser ? 'text-success' : ''}`}>
                              {entry.displayName}
                              {isCurrentUser && <small className="ms-1">(you)</small>}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">{entry.gamesPlayed}</td>
                        <td className="text-center">{entry.roundsPlayed}</td>
                        <td className="text-center fw-bold">{entry.averageScore}</td>
                        <td className="text-center">{entry.bestRoundScore || '-'}</td>
                        <td className="text-center d-none d-md-table-cell score-eagle">{entry.holesInOne || '-'}</td>
                        <td className="text-center d-none d-md-table-cell score-eagle">{entry.eagles || '-'}</td>
                        <td className="text-center d-none d-md-table-cell score-birdie">{entry.birdies || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
