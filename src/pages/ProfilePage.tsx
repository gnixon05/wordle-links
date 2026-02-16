import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { AvatarChoice, UserStats, HolePar } from '../types';
import Avatar from '../components/common/Avatar';
import AvatarPicker from '../components/common/AvatarPicker';
import { getGameById } from '../utils/storage';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, displayName } = useAuth();
  const { getUserResults, getUserInvitations, acceptInvitation, declineInvitation, getUserGames } = useGame();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState<AvatarChoice>(user?.avatar || { category: 'golfball', variant: 'cowboy' });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const invitations = getUserInvitations();
  const allResults = getUserResults(user.id);
  const myGames = getUserGames();

  // Calculate stats
  const stats: UserStats = {
    gamesPlayed: myGames.length,
    roundsPlayed: allResults.length,
    holesPlayed: allResults.reduce((s, r) => s + r.holes.length, 0),
    totalScore: allResults.reduce((s, r) => s + r.totalScore, 0),
    averageScorePerRound: allResults.length > 0
      ? Math.round(allResults.reduce((s, r) => s + r.totalScore, 0) / allResults.length * 10) / 10
      : 0,
    averageScorePerHole: 0,
    bestRoundScore: allResults.length > 0
      ? Math.min(...allResults.map(r => r.totalScore))
      : 0,
    holesInOne: 0,
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeys: 0,
    currentStreak: 0,
  };

  // Calculate hole-level stats
  allResults.forEach(r => {
    const game = getGameById(r.gameId);
    const round = game?.rounds.find(rd => rd.roundNumber === r.roundNumber);

    r.holes.forEach(h => {
      const holePar: HolePar = round?.holes.find(rh => rh.holeNumber === h.holeNumber)?.par || 4;
      const diff = h.score - holePar;

      if (h.score === 1) stats.holesInOne++;
      if (diff <= -2) stats.eagles++;
      else if (diff === -1) stats.birdies++;
      else if (diff === 0) stats.pars++;
      else if (diff === 1) stats.bogeys++;
      else stats.doubleBogeys++;
    });
  });

  const totalHoles = stats.holesPlayed;
  stats.averageScorePerHole = totalHoles > 0
    ? Math.round(stats.totalScore / totalHoles * 100) / 100
    : 0;

  const handleSave = () => {
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      avatar,
    });
    setEditing(false);
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ color: 'var(--wl-green-dark)' }}>Profile</h2>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card game-card">
            <div className="card-body text-center">
              {editing ? (
                <>
                  <div className="mb-3">
                    <AvatarPicker selected={avatar} onSelect={setAvatar} />
                  </div>
                  <div className="mb-2">
                    <input
                      className="form-control"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      className="form-control"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      placeholder="Nickname (optional)"
                    />
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-success btn-sm" onClick={handleSave}>Save</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex justify-content-center mb-3">
                    <Avatar avatar={user.avatar} size="large" />
                  </div>
                  <h5 className="fw-bold">{displayName}</h5>
                  <p className="text-muted small">{user.email}</p>
                  <p className="text-muted small">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <button className="btn btn-outline-success btn-sm" onClick={() => {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setNickname(user.nickname || '');
                    setAvatar(user.avatar);
                    setEditing(true);
                  }}>
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Invitations */}
          {invitations.length > 0 && (
            <div className="card game-card mt-3">
              <div className="card-header">
                Invitations <span className="badge bg-danger">{invitations.length}</span>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {invitations.map(game => (
                    <li key={game.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="small">{game.name}</span>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-success btn-sm py-0 px-2"
                          onClick={() => acceptInvitation(game.id)}
                        >
                          Join
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
                          onClick={() => declineInvitation(game.id)}
                        >
                          Pass
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="col-lg-8">
          <h5 className="fw-bold mb-3" style={{ color: 'var(--wl-green-dark)' }}>Career Statistics</h5>
          <div className="stats-grid mb-4">
            <div className="stat-card">
              <div className="stat-value">{stats.gamesPlayed}</div>
              <div className="stat-label">Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.roundsPlayed}</div>
              <div className="stat-label">Rounds</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.holesPlayed}</div>
              <div className="stat-label">Holes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageScorePerRound || '-'}</div>
              <div className="stat-label">Avg / Round</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageScorePerHole || '-'}</div>
              <div className="stat-label">Avg / Hole</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.bestRoundScore || '-'}</div>
              <div className="stat-label">Best Round</div>
            </div>
          </div>

          <h5 className="fw-bold mb-3" style={{ color: 'var(--wl-green-dark)' }}>Score Distribution</h5>
          <div className="stats-grid mb-4">
            <div className="stat-card">
              <div className="stat-value score-eagle">{stats.holesInOne}</div>
              <div className="stat-label">Holes-in-One</div>
            </div>
            <div className="stat-card">
              <div className="stat-value score-eagle">{stats.eagles}</div>
              <div className="stat-label">Eagles</div>
            </div>
            <div className="stat-card">
              <div className="stat-value score-birdie">{stats.birdies}</div>
              <div className="stat-label">Birdies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value score-par">{stats.pars}</div>
              <div className="stat-label">Pars</div>
            </div>
            <div className="stat-card">
              <div className="stat-value score-bogey">{stats.bogeys}</div>
              <div className="stat-label">Bogeys</div>
            </div>
            <div className="stat-card">
              <div className="stat-value score-double-bogey">{stats.doubleBogeys}</div>
              <div className="stat-label">Double+</div>
            </div>
          </div>

          {/* Game History */}
          <h5 className="fw-bold mb-3" style={{ color: 'var(--wl-green-dark)' }}>Game History</h5>
          {myGames.length === 0 ? (
            <p className="text-muted">No games played yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Game</th>
                    <th className="text-center">Rounds</th>
                    <th className="text-center">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myGames.map(game => {
                    const gameResults = allResults.filter(r => r.gameId === game.id);
                    return (
                      <tr key={game.id}>
                        <td className="fw-semibold">{game.name}</td>
                        <td className="text-center">{gameResults.length} / {game.rounds.length}</td>
                        <td className="text-center">
                          <span className="badge bg-success">Active</span>
                        </td>
                        <td className="text-end">
                          <Link to={`/game/${game.id}`} className="btn btn-outline-success btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
