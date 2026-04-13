import { User, GameVisibility } from '../../../types';
import { getDisplayName } from '../../../utils/gameLogic';

interface Props {
  gameName: string;
  onNameChange: (name: string) => void;
  visibility: GameVisibility;
  onVisibilityChange: (v: GameVisibility) => void;
  password: string;
  onPasswordChange: (p: string) => void;
  invitedIds: string[];
  onToggleInvite: (userId: string) => void;
  otherUsers: User[];
}

export default function GameSettingsCard({
  gameName, onNameChange,
  visibility, onVisibilityChange,
  password, onPasswordChange,
  invitedIds, onToggleInvite,
  otherUsers,
}: Props) {
  return (
    <div className="card game-card mb-4">
      <div className="card-header">Game Settings</div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label fw-semibold">Game Name *</label>
          <input
            type="text"
            className="form-control"
            value={gameName}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g., Sunday Round with Friends"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Visibility</label>
          <div className="d-flex gap-3">
            {(['public', 'private'] as const).map(v => (
              <div key={v} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="visibility"
                  id={`vis-${v}`}
                  checked={visibility === v}
                  onChange={() => onVisibilityChange(v)}
                />
                <label className="form-check-label" htmlFor={`vis-${v}`}>
                  {v === 'public' ? 'Public - Anyone can join' : 'Private - Invite only'}
                </label>
              </div>
            ))}
          </div>
        </div>

        {visibility === 'private' && (
          <>
            <div className="mb-3">
              <label className="form-label fw-semibold">Game Password (optional)</label>
              <input
                type="text"
                className="form-control"
                value={password}
                onChange={e => onPasswordChange(e.target.value)}
                placeholder="Users can join with this password"
              />
              <div className="form-text">Leave blank for invite-only access</div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Invite Players</label>
              {otherUsers.length === 0 ? (
                <p className="text-muted small">No other users registered yet.</p>
              ) : (
                <div className="row g-2">
                  {otherUsers.map(u => (
                    <div key={u.id} className="col-sm-6 col-md-4">
                      <div
                        className={`invite-player-card border rounded p-2 d-flex align-items-center gap-2 ${invitedIds.includes(u.id) ? 'selected border-success' : ''}`}
                        onClick={() => onToggleInvite(u.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={invitedIds.includes(u.id)}
                          readOnly
                        />
                        <span className="small">
                          {getDisplayName(u.firstName, u.lastName, u.nickname)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
