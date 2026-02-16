import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, isAuthenticated, logout, displayName } = useAuth();
  const { getUserInvitations } = useGame();
  const navigate = useNavigate();

  const invitations = isAuthenticated ? getUserInvitations() : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-golf sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="me-2">&#9971;</span>
          Wordle Tour
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMain"
          aria-controls="navMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard">Leaderboard</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative" to="/profile">
                    <span className="d-flex align-items-center gap-2">
                      <Avatar avatar={user.avatar} size="small" />
                      <span className="d-none d-md-inline">{displayName}</span>
                    </span>
                    {invitations.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {invitations.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm ms-lg-2" to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
