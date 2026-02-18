import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, isAuthenticated, logout, displayName } = useAuth();
  const { getUserInvitations } = useGame();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const invitations = isAuthenticated ? getUserInvitations() : [];

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-golf sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <span className="me-2">&#9971;</span>
          Wordle Tour
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navMain"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard" onClick={closeMenu}>Leaderboard</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {isAuthenticated && user ? (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative" to="/profile" onClick={closeMenu}>
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
                <li className="nav-item me-2">
                  <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                    {theme === 'light' ? '\u263E' : '\u2600'}
                  </button>
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
                  <Link className="nav-link" to="/login" onClick={closeMenu}>Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm ms-lg-2" to="/signup" onClick={closeMenu}>Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
