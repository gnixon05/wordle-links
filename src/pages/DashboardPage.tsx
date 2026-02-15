import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Game } from '../types';
import Avatar from '../components/common/Avatar';
import { getUserById } from '../utils/storage';
import { getDisplayName } from '../utils/gameLogic';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { getUserGames, getPublicGames, getUserInvitations, acceptInvitation, declineInvitation, joinGame } = useGame();
  const navigate = useNavigate();
  const [joinPassword, setJoinPassword] = useState('');
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'public' | 'invites'>('my');

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const myGames = getUserGames();
  const publicGames = getPublicGames().filter(g => !g.playerIds.includes(user.id));
  const invitations = getUserInvitations();

  const handleJoinPublic = (gameId: string) => {
    const result = joinGame(gameId);
    if (result.success) {
      navigate(`/game/${gameId}`);
    }
  };

  const handleJoinPrivate = (gameId: string) => {
    setJoinError('');
    const result = joinGame(gameId, joinPassword);
    if (result.success) {
      setJoiningGameId(null);
      setJoinPassword('');
      navigate(`/game/${gameId}`);
    } else {
      setJoinError(result.error || 'Failed to join');
    }
  };

  const handleAccept = (gameId: string) => {
    acceptInvitation(gameId);
    navigate(`/game/${gameId}`);
  };

  const getCreatorName = (creatorId: string): string => {
    const creator = getUserById(creatorId);
    if (!creator) return 'Unknown';
    return getDisplayName(creator.firstName, creator.lastName, creator.nickname);
  };

  const renderGameCard = (game: Game, actions: React.ReactNode) => (
    <div key={game.id} className="col-md-6 col-lg-4">
      <div className="card game-card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>{game.name}</span>
          <span className={`badge ${game.visibility === 'public' ? 'bg-success' : 'bg-warning text-dark'}`}>
            {game.visibility}
          </span>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <small className="text-muted">Created by: </small>
            <span className="fw-semibold">{getCreatorName(game.creatorId)}</span>
          </div>
          <div className="mb-2">
            <small className="text-muted">Players: </small>
            <span>{game.playerIds.length}</span>
          </div>
          <div className="mb-2">
            <small className="text-muted">Round: </small>
            <span>{game.currentRound}</span>
          </div>
          <div className="d-flex gap-1 flex-wrap mb-3">
            {game.playerIds.slice(0, 5).map(pid => {
              const p = getUserById(pid);
              if (!p) return null;
              return <Avatar key={pid} avatar={p.avatar} size="small" />;
            })}
            {game.playerIds.length > 5 && (
              <span className="badge bg-secondary align-self-center">+{game.playerIds.length - 5}</span>
            )}
          </div>
          {actions}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--wl-green-dark)' }}>
          Dashboard
        </h2>
        <Link to="/create-game" className="btn btn-success">
          + Create Game
        </Link>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
            style={activeTab === 'my' ? { backgroundColor: 'var(--wl-green-dark)' } : {}}
            onClick={() => setActiveTab('my')}
          >
            My Games ({myGames.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'public' ? 'active' : ''}`}
            style={activeTab === 'public' ? { backgroundColor: 'var(--wl-green-dark)' } : {}}
            onClick={() => setActiveTab('public')}
          >
            Public Games ({publicGames.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'invites' ? 'active' : ''}`}
            style={activeTab === 'invites' ? { backgroundColor: 'var(--wl-green-dark)' } : {}}
            onClick={() => setActiveTab('invites')}
          >
            Invitations
            {invitations.length > 0 && (
              <span className="badge bg-danger ms-1">{invitations.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* My Games */}
      {activeTab === 'my' && (
        <div className="row g-3">
          {myGames.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted mb-3">You haven't joined any games yet.</p>
              <Link to="/create-game" className="btn btn-outline-success">Create Your First Game</Link>
            </div>
          ) : (
            myGames.map(game =>
              renderGameCard(game, (
                <Link to={`/game/${game.id}`} className="btn btn-success btn-sm w-100">
                  Play
                </Link>
              ))
            )
          )}
        </div>
      )}

      {/* Public Games */}
      {activeTab === 'public' && (
        <div className="row g-3">
          {publicGames.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">No public games available to join right now.</p>
            </div>
          ) : (
            publicGames.map(game =>
              renderGameCard(game, (
                <button
                  className="btn btn-outline-success btn-sm w-100"
                  onClick={() => handleJoinPublic(game.id)}
                >
                  Join Game
                </button>
              ))
            )
          )}
        </div>
      )}

      {/* Invitations */}
      {activeTab === 'invites' && (
        <div className="row g-3">
          {invitations.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">No pending invitations.</p>
            </div>
          ) : (
            invitations.map(game => (
              <div key={game.id} className="col-md-6 col-lg-4">
                <div className="card game-card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>{game.name}</span>
                    <span className="badge bg-info">Invited</span>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <small className="text-muted">From: </small>
                      <span className="fw-semibold">{getCreatorName(game.creatorId)}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Players: </small>
                      <span>{game.playerIds.length}</span>
                    </div>

                    {game.password && joiningGameId === game.id && (
                      <div className="mb-2">
                        <input
                          type="password"
                          className="form-control form-control-sm mb-1"
                          placeholder="Game password"
                          value={joinPassword}
                          onChange={e => setJoinPassword(e.target.value)}
                        />
                        {joinError && <small className="text-danger">{joinError}</small>}
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => {
                          if (game.password && joiningGameId !== game.id) {
                            setJoiningGameId(game.id);
                          } else if (game.password) {
                            handleJoinPrivate(game.id);
                          } else {
                            handleAccept(game.id);
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => declineInvitation(game.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
