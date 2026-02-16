import { useState } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { HolePar, RoundConfig, ThemeOption } from '../types';
import GolfScorecard from '../components/game/GolfScorecard';
import Avatar from '../components/common/Avatar';
import { getUserById } from '../utils/storage';
import { getDisplayName, getScoreRelativeToPar, getScoreName } from '../utils/gameLogic';

export default function GameResultsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getGame, getUserResult, isRoundCompleteForAllPlayers, startNewRound } = useGame();

  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [showNewRound, setShowNewRound] = useState(false);

  const game = gameId ? getGame(gameId) : undefined;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!game) {
    return (
      <div className="container py-5 text-center">
        <h3>Game not found</h3>
        <Link to="/dashboard" className="btn btn-success mt-3">Back to Dashboard</Link>
      </div>
    );
  }

  const roundNumber = selectedRound || game.currentRound;
  const round = game.rounds.find(r => r.roundNumber === roundNumber);
  const allComplete = isRoundCompleteForAllPlayers(gameId!, roundNumber);
  const isCreator = game.creatorId === user.id;

  // Get all player results for this round
  const playerResults = game.playerIds.map(pid => {
    const playerUser = getUserById(pid);
    const result = getUserResult(gameId!, roundNumber, pid);
    return {
      userId: pid,
      name: playerUser ? getDisplayName(playerUser.firstName, playerUser.lastName, playerUser.nickname) : 'Unknown',
      avatar: playerUser?.avatar || { category: 'golfball' as const, variant: 'cowboy' },
      result,
      isComplete: result?.completedAt != null,
    };
  });

  // Sort by total score (lowest first)
  const sortedResults = [...playerResults].sort((a, b) => {
    if (!a.result && !b.result) return 0;
    if (!a.result) return 1;
    if (!b.result) return -1;
    return a.result.totalScore - b.result.totalScore;
  });

  // Calculate total par
  const totalPar = round ? round.holes.reduce((s, h) => s + h.par, 0) : 72;

  const handleStartNewRound = () => {
    if (!game) return;
    const newRoundNum = game.rounds.length + 1;
    const newRound: RoundConfig = {
      roundNumber: newRoundNum,
      holes: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4 as HolePar,
      })),
      frontNineTheme: 'golf' as ThemeOption,
      backNineTheme: 'golf' as ThemeOption,
      startDate: new Date().toISOString(),
    };
    startNewRound(gameId!, newRound);
    setShowNewRound(false);
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: 'var(--wl-green-dark)' }}>{game.name}</h3>
          <small className="text-muted">Results</small>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/game/${gameId}`} className="btn btn-success btn-sm">Play</Link>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Dashboard</Link>
        </div>
      </div>

      {/* Round Selector */}
      {game.rounds.length > 1 && (
        <div className="mb-3">
          <label className="form-label fw-semibold">Select Round</label>
          <div className="d-flex gap-2 flex-wrap">
            {game.rounds.map(r => (
              <button
                key={r.roundNumber}
                className={`btn btn-sm ${roundNumber === r.roundNumber ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setSelectedRound(r.roundNumber)}
              >
                Round {r.roundNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {!allComplete ? (
        <div className="alert alert-warning text-center">
          <strong>Round in progress.</strong> Results will be revealed when all players have completed their round.
          <div className="mt-2">
            {playerResults.map(p => (
              <span key={p.userId} className={`badge me-1 ${p.isComplete ? 'bg-success' : 'bg-secondary'}`}>
                {p.name}: {p.isComplete ? 'Done' : 'Playing'}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Leaderboard */}
          <div className="card game-card mb-4">
            <div className="card-header">
              <span className="me-2">&#127942;</span> Round {roundNumber} Leaderboard
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Player</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">vs Par</th>
                      <th className="text-center d-none d-md-table-cell">Eagles</th>
                      <th className="text-center d-none d-md-table-cell">Birdies</th>
                      <th className="text-center d-none d-md-table-cell">Pars</th>
                      <th className="text-center d-none d-md-table-cell">Bogeys+</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((player, idx) => {
                      const holes = player.result?.holes || [];
                      const roundHoles = round?.holes || [];
                      let eagles = 0, birdies = 0, pars = 0, bogeyPlus = 0;

                      holes.forEach(h => {
                        const holePar = roundHoles.find(rh => rh.holeNumber === h.holeNumber)?.par || 4;
                        const diff = h.score - holePar;
                        if (diff <= -2) eagles++;
                        else if (diff === -1) birdies++;
                        else if (diff === 0) pars++;
                        else bogeyPlus++;
                      });

                      return (
                        <tr key={player.userId}>
                          <td>
                            {idx === 0 && '&#127942;'}
                            {idx === 1 && '&#129352;'}
                            {idx === 2 && '&#129353;'}
                            {idx > 2 && (idx + 1)}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Avatar avatar={player.avatar} size="small" />
                              <span className="fw-semibold">{player.name}</span>
                            </div>
                          </td>
                          <td className="text-center fw-bold">
                            {player.result?.totalScore || '-'}
                          </td>
                          <td className="text-center fw-bold">
                            {player.result
                              ? getScoreRelativeToPar(player.result.totalScore, totalPar as HolePar)
                              : '-'}
                          </td>
                          <td className="text-center d-none d-md-table-cell score-eagle">{eagles || '-'}</td>
                          <td className="text-center d-none d-md-table-cell score-birdie">{birdies || '-'}</td>
                          <td className="text-center d-none d-md-table-cell score-par">{pars || '-'}</td>
                          <td className="text-center d-none d-md-table-cell score-bogey">{bogeyPlus || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Individual Scorecards */}
          <h5 className="fw-bold mb-3" style={{ color: 'var(--wl-green-dark)' }}>Player Scorecards</h5>
          {sortedResults.map(player => (
            <div key={player.userId} className="card game-card mb-3">
              <div className="card-header d-flex align-items-center gap-2">
                <Avatar avatar={player.avatar} size="small" />
                <span>{player.name}</span>
                {player.result && (
                  <span className="badge bg-dark ms-auto">
                    {player.result.totalScore} ({getScoreRelativeToPar(player.result.totalScore, totalPar as HolePar)})
                  </span>
                )}
              </div>
              <div className="card-body">
                {player.result && round ? (
                  <GolfScorecard
                    holes={round.holes}
                    results={player.result.holes}
                    playerName={player.name}
                  />
                ) : (
                  <p className="text-muted mb-0">No results yet</p>
                )}
              </div>
            </div>
          ))}

          {/* Player Boards (show actual Wordle grids) */}
          <h5 className="fw-bold mb-3 mt-4" style={{ color: 'var(--wl-green-dark)' }}>Wordle Boards</h5>
          {sortedResults.map(player => (
            <div key={`boards-${player.userId}`} className="card game-card mb-3">
              <div className="card-header d-flex align-items-center gap-2">
                <Avatar avatar={player.avatar} size="small" />
                <span>{player.name} - Boards</span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {(player.result?.holes || []).map(hole => {
                    const holePar = round?.holes.find(h => h.holeNumber === hole.holeNumber)?.par || 4;
                    return (
                      <div key={hole.holeNumber} className="col-6 col-md-4 col-lg-3">
                        <div className="border rounded p-2 text-center">
                          <div className="fw-semibold small mb-1">
                            Hole {hole.holeNumber}
                            <span className={`ms-1 ${hole.solved ? 'text-success' : 'text-danger'}`}>
                              {hole.solved ? getScoreName(hole.score, holePar) : 'DNF'}
                            </span>
                          </div>
                          <div className="d-flex flex-column align-items-center gap-1">
                            {hole.guesses.map((row, ri) => (
                              <div key={ri} className="d-flex gap-1">
                                {row.map((tile, ti) => (
                                  <div
                                    key={ti}
                                    className={`wordle-tile ${tile.status}`}
                                    style={{ width: '24px', height: '24px', fontSize: '0.65rem', border: '1px solid #ccc' }}
                                  >
                                    {tile.letter}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Start New Round (Creator only) */}
          {isCreator && (
            <div className="text-center mt-4">
              {showNewRound ? (
                <div className="card game-card">
                  <div className="card-body text-center">
                    <p>Start a new round with default settings (all Par 4)?</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-success" onClick={handleStartNewRound}>
                        Start Round {game.rounds.length + 1}
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => setShowNewRound(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn btn-success btn-lg" onClick={() => setShowNewRound(true)}>
                  Start New Round
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
