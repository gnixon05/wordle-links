import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarChoice } from '../types';
import AvatarPicker from '../components/common/AvatarPicker';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<AvatarChoice>({ category: 'golfball', variant: 'cowboy' });
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = signup({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      nickname: nickname.trim() || undefined,
      avatar,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed.');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card game-card">
            <div className="card-header text-center py-3">
              <h4 className="mb-0">Create Your Account</h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <div className="form-text">At least 6 characters</div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nickname (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="Leave blank to use First Name + Last Initial"
                  />
                  <div className="form-text">
                    {nickname.trim()
                      ? `Display name: ${nickname.trim()}`
                      : firstName.trim()
                        ? `Display name: ${firstName.trim()} ${lastName.trim() ? lastName.trim().charAt(0) + '.' : ''}`
                        : 'Your display name will be shown to other players'}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Choose Your Avatar *</label>
                  <AvatarPicker selected={avatar} onSelect={setAvatar} />
                </div>

                <button type="submit" className="btn btn-success btn-lg w-100">
                  Create Account
                </button>
              </form>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
