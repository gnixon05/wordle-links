import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateGamePage from './pages/CreateGamePage';
import GamePlayPage from './pages/GamePlayPage';
import GameResultsPage from './pages/GameResultsPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

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
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/create-game" element={<CreateGamePage />} />
              <Route path="/game/:gameId" element={<GamePlayPage />} />
              <Route path="/game/:gameId/results" element={<GameResultsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>
          </Routes>
        </GameProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
