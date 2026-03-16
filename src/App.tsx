import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateGamePage from './pages/CreateGamePage';
import GamePlayPage from './pages/GamePlayPage';
import GameResultsPage from './pages/GameResultsPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import DailyLeaderboardPage from './pages/DailyLeaderboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <GameProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/create-game" element={<ProtectedRoute><CreateGamePage /></ProtectedRoute>} />
              <Route path="/game/:gameId" element={<ProtectedRoute><GamePlayPage /></ProtectedRoute>} />
              <Route path="/game/:gameId/results" element={<ProtectedRoute><GameResultsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/daily" element={<ProtectedRoute><DailyLeaderboardPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </GameProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
