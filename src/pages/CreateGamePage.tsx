import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCreateGameForm } from '../components/game/create/useCreateGameForm';
import GameSettingsCard from '../components/game/create/GameSettingsCard';
import WordModeSelector from '../components/game/create/WordModeSelector';
import StartWordConfig from '../components/game/create/StartWordConfig';
import HoleSettingsPanel from '../components/game/create/HoleSettingsPanel';

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { user, allUsers } = useAuth();
  const form = useCreateGameForm();

  if (!user) return null;

  const otherUsers = allUsers.filter(u => u.id !== user.id);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h2 className="fw-bold mb-4" style={{ color: 'var(--wl-green-dark)' }}>
            Create New Game
          </h2>

          {form.error && <div className="alert alert-danger">{form.error}</div>}

          <form onSubmit={form.handleSubmit}>
            <GameSettingsCard
              gameName={form.gameName}
              onNameChange={form.setGameName}
              visibility={form.visibility}
              onVisibilityChange={form.setVisibility}
              password={form.password}
              onPasswordChange={form.setPassword}
              invitedIds={form.invitedIds}
              onToggleInvite={form.toggleInvite}
              otherUsers={otherUsers}
            />

            {/* Hole Configuration */}
            <div className="card game-card mb-4">
              <div className="card-header">Hole Configuration</div>
              <div className="card-body">
                <WordModeSelector
                  wordMode={form.wordMode}
                  onChange={form.handleWordModeChange}
                />

                {form.wordMode === 'classic' && (
                  <div className="alert alert-info small mb-3">
                    Each hole will use the official daily word for the day it unlocks.
                    Hole 1 uses today's word, Hole 2 uses tomorrow's, and so on.
                    All 18 holes are Par 4 (5-letter words, 6 guesses).
                  </div>
                )}

                <StartWordConfig
                  startWordModeFront={form.startWordModeFront}
                  onFrontModeChange={form.setStartWordModeFront}
                  startWordThemeFront={form.startWordThemeFront}
                  onFrontThemeChange={form.setStartWordThemeFront}
                  startWordModeBack={form.startWordModeBack}
                  onBackModeChange={form.setStartWordModeBack}
                  startWordThemeBack={form.startWordThemeBack}
                  onBackThemeChange={form.setStartWordThemeBack}
                />

                {/* Winner Picks Rule */}
                <div className="mb-3 p-3 border rounded config-panel">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="winnerPicks"
                      checked={form.winnerPicks}
                      onChange={e => form.setWinnerPicks(e.target.checked)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="winnerPicks">
                      Winner Picks Next Hole Rule
                    </label>
                  </div>
                  <div className="form-text mt-1">
                    When enabled, the winner of each hole sets the word rule for the next hole.
                    You only need to set the starting rule for Hole 1 (and Hole 10 for back 9).
                    The winner chooses from the same options available for the front/back 9
                    (category, constraints, or custom word).
                  </div>
                </div>

                <HoleSettingsPanel
                  holes={form.holes}
                  wordMode={form.wordMode}
                  winnerPicks={form.winnerPicks}
                  startWordModeFront={form.startWordModeFront}
                  startWordModeBack={form.startWordModeBack}
                  showAdvanced={form.showAdvanced}
                  onToggleAdvanced={() => form.setShowAdvanced(!form.showAdvanced)}
                  onUpdatePar={form.updateHolePar}
                  onUpdateWord={form.updateHoleWord}
                  onUpdateStartWord={form.updateHoleStartWord}
                  onUpdateConstraint={form.updateHoleConstraint}
                />
              </div>
            </div>

            {/* Daily Schedule Info */}
            <div className="card game-card mb-4">
              <div className="card-header">Daily Schedule</div>
              <div className="card-body">
                <div className="alert alert-info small mb-0">
                  Each hole unlocks one per day at 12:00 AM local time. Hole 1 is available on the day
                  the game is created, Hole 2 on the next day, and so on through all 18 holes.
                  Holes can only be played on their designated day.
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success btn-lg px-4">
                Create Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
