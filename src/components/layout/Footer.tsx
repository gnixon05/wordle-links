export default function Footer() {
  return (
    <footer className="footer-golf mt-auto">
      <div className="container text-center">
        <p className="mb-1">
          <span className="me-1">&#9971;</span>
          <strong>Wordle Tour</strong> &mdash; A Golf-Themed Word Game
        </p>
        <small className="d-block mb-1">
          Guess the word. Beat the par. Climb the leaderboard.
        </small>
        <small className="text-white-50">
          &copy; {new Date().getFullYear()} Wordle Tour &bull; CC0 1.0 Public Domain
        </small>
      </div>
    </footer>
  );
}
