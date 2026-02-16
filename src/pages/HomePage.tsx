import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { PexelsPhoto, searchGolfPhotos } from '../utils/pexels';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [bgImage, setBgImage] = useState<PexelsPhoto | null>(null);

  useEffect(() => {
    searchGolfPhotos('golf course green landscape').then(photos => {
      if (photos.length > 0) {
        setBgImage(photos[0]);
      }
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div
          className="hero-bg"
          style={bgImage ? { backgroundImage: `url(${bgImage.src.large2x})` } : { background: 'var(--wl-green-dark)' }}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="display-3 fw-bold mb-3">
            <span className="me-2">&#9971;</span>Wordle Tour
          </h1>
          <p className="lead mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
            The golf-themed word game where every guess counts as a stroke.
            Play 18 holes of Wordle, compete with friends, and climb the leaderboard.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-warning btn-lg px-4 fw-bold">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-warning btn-lg px-4 fw-bold">
                  Start Playing
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: 'var(--wl-green-dark)' }}>
            How It Works
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 game-card">
                <div className="card-header text-center py-3">
                  <span style={{ fontSize: '2rem' }}>&#127951;</span>
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">18 Holes of Wordle</h5>
                  <p className="card-text text-muted">
                    Each round has 18 holes, just like real golf. Every hole is a word puzzle.
                    Par 3 holes use 4-letter words (5 guesses), Par 4 uses 5-letter words (6 guesses),
                    and Par 5 uses 6-letter words (7 guesses).
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 game-card">
                <div className="card-header text-center py-3">
                  <span style={{ fontSize: '2rem' }}>&#127942;</span>
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Golf Scoring</h5>
                  <p className="card-text text-muted">
                    Your number of guesses equals your strokes. Solve it in fewer guesses than par
                    for a birdie or eagle! Use too many and you'll be looking at a bogey. Lowest score wins.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 game-card">
                <div className="card-header text-center py-3">
                  <span style={{ fontSize: '2rem' }}>&#129309;</span>
                </div>
                <div className="card-body text-center">
                  <h5 className="card-title">Compete with Friends</h5>
                  <p className="card-text text-muted">
                    Create public or private games, invite friends, and compete head-to-head.
                    Results stay hidden until everyone finishes, then see the full scorecard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Guide */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: 'var(--wl-green-dark)' }}>
            Scoring Guide (Par 4 Example)
          </h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="table-responsive">
                <table className="table table-hover text-center">
                  <thead style={{ backgroundColor: 'var(--wl-green-dark)', color: 'white' }}>
                    <tr>
                      <th>Guesses</th>
                      <th>Golf Score</th>
                      <th>Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td className="score-eagle fw-bold">-3</td><td>Hole in One!</td></tr>
                    <tr><td>2</td><td className="score-eagle fw-bold">-2</td><td>Eagle</td></tr>
                    <tr><td>3</td><td className="score-birdie fw-bold">-1</td><td>Birdie</td></tr>
                    <tr><td>4</td><td className="score-par fw-bold">E</td><td>Par</td></tr>
                    <tr><td>5</td><td className="score-bogey fw-bold">+1</td><td>Bogey</td></tr>
                    <tr><td>6</td><td className="score-double-bogey fw-bold">+2</td><td>Double Bogey</td></tr>
                    <tr><td>DNF</td><td className="score-double-bogey fw-bold">+3</td><td>Triple Bogey</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: 'var(--wl-green-dark)' }}>
            Features
          </h2>
          <div className="row g-4">
            {[
              { icon: '&#127919;', title: 'Themed Rounds', desc: 'Choose word themes like Golf, Sports, Nature, Food, or Animals for your front and back 9.' },
              { icon: '&#128274;', title: 'Private Games', desc: 'Create invite-only games or set a password. Challenge specific friends to a round.' },
              { icon: '&#128202;', title: 'Full Statistics', desc: 'Track your career stats: birdies, eagles, holes-in-one, average scores, and more.' },
              { icon: '&#128203;', title: 'Scorecards', desc: 'Beautiful golf scorecards showing every hole, every player, every round.' },
              { icon: '&#127760;', title: 'Unlimited Rounds', desc: 'Games can run for unlimited rounds. The game creator sets up each new round.' },
              { icon: '&#128081;', title: 'Leaderboards', desc: 'Compete for the top spot on the global leaderboard across all games.' },
            ].map((feat, i) => (
              <div key={i} className="col-md-4 col-sm-6">
                <div className="text-center">
                  <div style={{ fontSize: '2.5rem' }} dangerouslySetInnerHTML={{ __html: feat.icon }} />
                  <h5 className="mt-2">{feat.title}</h5>
                  <p className="text-muted small">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-5 text-center text-white" style={{ background: 'linear-gradient(135deg, var(--wl-green-dark), var(--wl-green-medium))' }}>
          <div className="container">
            <h2 className="fw-bold mb-3">Ready to Tee Off?</h2>
            <p className="lead mb-4">Sign up for free and start your first round today.</p>
            <Link to="/signup" className="btn btn-warning btn-lg px-5 fw-bold">
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
