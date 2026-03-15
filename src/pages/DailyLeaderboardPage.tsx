import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { HolePar } from '../types';
import Avatar from '../components/common/Avatar';
import {
  getDisplayName,
  getScoreName,
  getTodayDateString,
  getHoleAvailability,
  formatHoleDate,
} from '../utils/gameLogic';

interface DailyPlayerResult {
  userId: string;
  displayName: string;
  avatar: { category: 'golfball' | 'penguin'; variant: string };
  score: number | null;
  solved: boolean;
  guesses: { letter: string; status: string }[][];
  hasPlayed: boolean;
}

interface DailyGameEntry {
  gameId: string;
  gameName: string;
  holeNumber: number;
  holePar: HolePar;
  holeDate: string;
  players: DailyPlayerResult[];
  currentUserHasPlayed: boolean;
}

export default function DailyLeaderboardPage() {
  const { isAuthenticated, user, allUsers } = useAuth();
  const { getUserGames, getUserResult } = useGame();

  const todayStr = getTodayDateString();
  const [dailyEntries, setDailyEntries] = useState<DailyGameEntry[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadEntries = async () => {
      const myGames = getUserGames();
      const entries: DailyGameEntry[] = [];

      for (const game of myGames) {
        const round = game.rounds.find(r => r.roundNumber === game.currentRound);
        if (!round) continue;

        let todaysHole: number | null = null;
        for (let i = 1; i <= round.holes.length; i++) {
          const availability = getHoleAvailability(round.startDate, i);
          if (availability === 'available') {
            todaysHole = i;
            break;
          }
        }

        if (todaysHole === null) continue;

        const holeConfig = round.holes.find(h => h.holeNumber === todaysHole);
        if (!holeConfig) continue;

        const players: DailyPlayerResult[] = await Promise.all(
          game.playerIds.map(async pid => {
            const playerUser = allUsers.find(u => u.id === pid);
            const result = await getUserResult(game.id, game.currentRound, pid);
            const holeResult = result?.holes.find(h => h.holeNumber === todaysHole);

            return {
              userId: pid,
              displayName: playerUser
                ? getDisplayName(playerUser.firstName, playerUser.lastName, playerUser.nickname)
                : 'Unknown',
              avatar: playerUser?.avatar || { category: 'golfball' as const, variant: 'cowboy' },
              score: holeResult ? holeResult.score : null,
              solved: holeResult?.solved ?? false,
              guesses: holeResult?.guesses ?? [],
              hasPlayed: !!holeResult,
            };
          })
        );

        players.sort((a, b) => {
          if (a.hasPlayed && !b.hasPlayed) return -1;
          if (!a.hasPlayed && b.hasPlayed) return 1;
          if (a.score !== null && b.score !== null) return a.score - b.score;
          return 0;
        });

        const currentUserHasPlayed = players.some(
          p => p.userId === user.id && p.hasPlayed
        );

        entries.push({
          gameId: game.id,
          gameName: game.name,
          holeNumber: todaysHole,
          holePar: holeConfig.par,
          holeDate: formatHoleDate(round.startDate, todaysHole),
          players,
          currentUserHasPlayed,
        });
      }

      setDailyEntries(entries);
    };

    loadEntries();
  }, [isAuthenticated, user, getUserGames, getUserResult, allUsers]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: 'var(--wl-green-dark)' }}>
            <span className="me-2">&#128197;</span>Daily Leaderboard
          </h2>
          <small className="text-muted">Today &mdash; {todayStr}</small>
        </div>
        <Link to="/leaderboard" className="btn btn-outline-success btn-sm">
          Overall Leaderboard
        </Link>
      </div>

      {dailyEntries.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">No holes available today.</p>
          <p className="text-muted">
            Join or create a game to see daily results!
          </p>
          <Link to="/dashboard" className="btn btn-success mt-2">Go to Dashboard</Link>
        </div>
      ) : (
        dailyEntries.map(entry => (
          <div key={entry.gameId} className="card game-card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-bold">{entry.gameName}</span>
                <span className="ms-2 badge bg-success">
                  Hole {entry.holeNumber} &bull; Par {entry.holePar}
                </span>
              </div>
              <Link to={`/game/${entry.gameId}`} className="btn btn-success btn-sm">
                Play
              </Link>
            </div>
            <div className="card-body">
              {entry.players.every(p => !p.hasPlayed) ? (
                <p className="text-muted text-center mb-0">
                  No one has played today's hole yet. Be the first!
                </p>
              ) : (
                <div className="row g-3">
                  {entry.players.map((player, idx) => {
                    const isCurrentUser = player.userId === user?.id;
                    const rank = player.hasPlayed ? idx + 1 : null;
                    const canSeeBoard = isCurrentUser || entry.currentUserHasPlayed;

                    return (
                      <div key={player.userId} className="col-12 col-md-6 col-lg-4">
                        <div
                          className={`border rounded p-3 h-100 ${isCurrentUser ? 'border-success border-2' : ''}`}
                          style={{ backgroundColor: isCurrentUser ? 'var(--wl-card-highlight, rgba(40,167,69,0.05))' : undefined }}
                        >
                          {/* Player header */}
                          <div className="d-flex align-items-center gap-2 mb-2">
                            {rank !== null && canSeeBoard && (
                              <span className="fw-bold" style={{ minWidth: '24px' }}>
                                {rank === 1 && <span dangerouslySetInnerHTML={{ __html: '&#127942;' }} />}
                                {rank === 2 && <span dangerouslySetInnerHTML={{ __html: '&#129352;' }} />}
                                {rank === 3 && <span dangerouslySetInnerHTML={{ __html: '&#129353;' }} />}
                                {rank > 3 && rank}
                              </span>
                            )}
                            <Avatar avatar={player.avatar} size="small" />
                            <span className={`fw-semibold ${isCurrentUser ? 'text-success' : ''}`}>
                              {player.displayName}
                              {isCurrentUser && <small className="ms-1">(you)</small>}
                            </span>
                          </div>

                          {player.hasPlayed && canSeeBoard ? (
                            <>
                              {/* Score badge */}
                              <div className="mb-2">
                                <span className={`badge ${player.solved ? 'bg-success' : 'bg-danger'}`}>
                                  {player.solved
                                    ? `${getScoreName(player.score!, entry.holePar)} (${player.score})`
                                    : 'DNF'
                                  }
                                </span>
                              </div>

                              {/* Wordle board */}
                              <div className="d-flex flex-column align-items-center gap-1">
                                {player.guesses.map((row, ri) => (
                                  <div key={ri} className="d-flex gap-1">
                                    {row.map((tile, ti) => (
                                      <div
                                        key={ti}
                                        className={`wordle-tile ${tile.status}`}
                                        style={{
                                          width: '28px',
                                          height: '28px',
                                          fontSize: '0.7rem',
                                          border: '1px solid #ccc',
                                        }}
                                      >
                                        {tile.letter}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : player.hasPlayed && !canSeeBoard ? (
                            <div className="text-center text-muted py-3">
                              <small>Complete today's hole to see this board</small>
                            </div>
                          ) : (
                            <div className="text-center text-muted py-3">
                              <small>Hasn't played yet</small>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
