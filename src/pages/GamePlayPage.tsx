import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { GuessRow, HoleResult, HolePar, WordConstraints } from '../types';
import WordleBoard from '../components/game/WordleBoard';
import Keyboard from '../components/game/Keyboard';
import HoleNavigator from '../components/game/HoleNavigator';
import GolfScorecard from '../components/game/GolfScorecard';
import {
  evaluateGuess,
  getWordLengthForPar,
  getMaxGuessesForPar,
  calculateHoleScore,
  getScoreName,
  getScoreRelativeToPar,
  calculateRoundScoreRelativeToPar,
  buildKeyboardState,
  isGuessCorrect,
  isValidWord,
  getHoleAvailability,
  getTodaysHoleNumber,
  formatHoleDate,
  getHoleAvailableDate,
  fetchDailyWordleWord,
  generateFallbackClassicWord,
} from '../utils/gameLogic';

export default function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const {
    getGame, getWordsForRound, getStartWordsForRound, updateWordForHole,
    submitHoleResult, getUserResult, isRoundCompleteForAllPlayers,
    autoScoreMissedHoles, updateHoleConstraints,
  } = useGame();

  const [currentHole, setCurrentHole] = useState(1);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [startWordApplied, setStartWordApplied] = useState(false);
  const [fetchingWord, setFetchingWord] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [fetchedWords, setFetchedWords] = useState<Record<number, string>>({});

  // Async-loaded data
  const [words, setWords] = useState<string[]>([]);
  const [startWords, setStartWords] = useState<string[]>([]);
  const [completedHoles, setCompletedHoles] = useState<HoleResult[]>([]);
  const [userResultCompletedAt, setUserResultCompletedAt] = useState<string | undefined>();
  const [allComplete, setAllComplete] = useState(false);

  // Winner picks state
  const [wpStartsWith, setWpStartsWith] = useState('');
  const [wpEndsWith, setWpEndsWith] = useState('');
  const [wpContains, setWpContains] = useState('');
  const [wpLetterPool, setWpLetterPool] = useState('');
  const [wpSubmitted, setWpSubmitted] = useState<Record<number, boolean>>({});

  const game = gameId ? getGame(gameId) : undefined;
  const roundNumber = game?.currentRound || 1;
  const round = game?.rounds.find(r => r.roundNumber === roundNumber);
  const startDate = round?.startDate || '';

  // Load words and user result from API
  useEffect(() => {
    if (!gameId) return;
    getWordsForRound(gameId, roundNumber).then(setWords);
    getStartWordsForRound(gameId, roundNumber).then(setStartWords);
  }, [gameId, roundNumber, getWordsForRound, getStartWordsForRound]);

  // Load user result
  const loadUserResult = useCallback(() => {
    if (!gameId || !user) return;
    getUserResult(gameId, roundNumber, user.id).then(result => {
      setCompletedHoles(result?.holes || []);
      setUserResultCompletedAt(result?.completedAt);
    });
  }, [gameId, roundNumber, user, getUserResult]);

  useEffect(() => {
    loadUserResult();
  }, [loadUserResult]);

  // Auto-score any missed/expired holes with DNF
  const hasAutoScored = useRef(false);
  useEffect(() => {
    if (!gameId || !user || !round || hasAutoScored.current) return;
    hasAutoScored.current = true;
    autoScoreMissedHoles(gameId, roundNumber).then(didScore => {
      if (didScore) loadUserResult(); // reload to pick up auto-scored holes
    });
  }, [gameId, user, round, roundNumber, autoScoreMissedHoles, loadUserResult]);

  // Check if all players complete
  useEffect(() => {
    if (!gameId) return;
    isRoundCompleteForAllPlayers(gameId, roundNumber).then(setAllComplete);
  }, [gameId, roundNumber, isRoundCompleteForAllPlayers, userResultCompletedAt]);

  const holeConfig = round?.holes.find(h => h.holeNumber === currentHole);
  const par: HolePar = holeConfig?.par || 4;
  const wordLength = getWordLengthForPar(par);
  const maxGuesses = getMaxGuessesForPar(par);
  const isClassicMode = round?.wordMode === 'classic';
  const storedWord = words[currentHole - 1] || '';
  const targetWord = fetchedWords[currentHole] || storedWord;
  const startWord = startWords[currentHole - 1] || '';
  const holeStartWordMode = currentHole <= 9
    ? (round?.startWordModeFront || round?.startWordMode || 'none')
    : (round?.startWordModeBack || round?.startWordMode || 'none');
  const hasStartWord = startWord.length > 0 && holeStartWordMode !== 'none';

  const currentHoleResult = completedHoles.find(h => h.holeNumber === currentHole);
  const currentHoleCompleted = !!currentHoleResult;

  const holeAvailability = startDate ? getHoleAvailability(startDate, currentHole) : 'available';
  const isHoleLocked = holeAvailability === 'locked';
  const isHolePast = holeAvailability === 'past' && !currentHoleResult;
  const isHolePlayable = holeAvailability === 'available' && !currentHoleResult;

  // Fetch word from Wordle API for classic mode
  const fetchWordForHole = useCallback(() => {
    if (!isClassicMode || !gameId || !startDate) return;
    if (targetWord) return;
    if (isHoleLocked) return;

    const holeDate = getHoleAvailableDate(startDate, currentHole);
    const dateStr = `${holeDate.getFullYear()}-${String(holeDate.getMonth() + 1).padStart(2, '0')}-${String(holeDate.getDate()).padStart(2, '0')}`;

    setFetchingWord(true);
    setFetchFailed(false);
    fetchDailyWordleWord(dateStr).then(word => {
      if (word) {
        setFetchedWords(prev => ({ ...prev, [currentHole]: word }));
        updateWordForHole(gameId, roundNumber, currentHole - 1, word);
      } else {
        // Use deterministic fallback so all players still get the same word
        console.warn(`[Wordle] Using fallback word for ${dateStr}`);
        const fallback = generateFallbackClassicWord(dateStr);
        setFetchedWords(prev => ({ ...prev, [currentHole]: fallback }));
        updateWordForHole(gameId, roundNumber, currentHole - 1, fallback);
        setFetchFailed(true); // still show the warning, but game continues
      }
      setFetchingWord(false);
    });
  }, [isClassicMode, gameId, startDate, currentHole, targetWord, isHoleLocked, roundNumber, updateWordForHole]);

  useEffect(() => {
    if (!isClassicMode || !gameId || !startDate) return;
    if (targetWord || isHoleLocked || fetchingWord) return;
    fetchWordForHole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClassicMode, gameId, startDate, currentHole, targetWord, isHoleLocked]);

  // Auto-navigate to today's hole on mount (or last played hole if round is done)
  const hasAutoNavigated = useRef(false);
  useEffect(() => {
    if (round && !hasAutoNavigated.current) {
      hasAutoNavigated.current = true;
      const todaysHole = getTodaysHoleNumber(startDate, round.holes.length);
      if (todaysHole !== null) {
        setCurrentHole(todaysHole);
      } else if (completedHoles.length > 0) {
        // All holes are past/locked — show the last completed hole
        const lastCompleted = [...completedHoles].sort((a, b) => b.holeNumber - a.holeNumber)[0];
        setCurrentHole(lastCompleted.holeNumber);
      }
    }
  }, [round, startDate, completedHoles]);

  // Load existing result for current hole
  useEffect(() => {
    if (currentHoleResult) {
      setGuesses(currentHoleResult.guesses);
      setGameOver(true);
      setSolved(currentHoleResult.solved);
      setStartWordApplied(true);
    } else {
      setGuesses([]);
      setGameOver(false);
      setSolved(false);
      setCurrentGuess('');
      setStartWordApplied(false);
      setFetchFailed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHole, currentHoleCompleted]);

  // Auto-apply start word as first guess when hole is playable and has a start word
  const startWordRef = useRef(false);
  useEffect(() => {
    if (
      hasStartWord &&
      isHolePlayable &&
      !startWordApplied &&
      !currentHoleResult &&
      guesses.length === 0 &&
      targetWord &&
      !startWordRef.current
    ) {
      startWordRef.current = true;
      const result = evaluateGuess(startWord, targetWord);
      const newGuesses = [result];
      setGuesses(newGuesses);
      setStartWordApplied(true);

      const correct = isGuessCorrect(result);
      if (correct) {
        const score = calculateHoleScore(true, 1, par);
        const holeResult: HoleResult = {
          holeNumber: currentHole,
          guesses: newGuesses,
          targetWord,
          solved: true,
          score,
        };
        if (gameId && user) {
          submitHoleResult(gameId, roundNumber, holeResult).then(loadUserResult);
        }
        setGameOver(true);
        setSolved(true);
      }
    }
    return () => { startWordRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasStartWord, isHolePlayable, startWordApplied, currentHoleCompleted,
    guesses.length, targetWord, startWord, par, currentHole, gameId,
    user, roundNumber, submitHoleResult, loadUserResult,
  ]);

  const displayMessage = useCallback((msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2500);
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver || isHoleLocked || isHolePast) return;
    if (currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key);
    }
  }, [gameOver, isHoleLocked, isHolePast, currentGuess, wordLength]);

  const handleBackspace = useCallback(() => {
    if (gameOver || isHoleLocked || isHolePast) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameOver, isHoleLocked, isHolePast]);

  const handleEnter = useCallback(() => {
    if (gameOver || !gameId || !user || isHoleLocked || isHolePast) return;

    if (currentGuess.length !== wordLength) {
      displayMessage('Not enough letters');
      return;
    }

    if (!isValidWord(currentGuess, wordLength)) {
      displayMessage('Not in word list');
      return;
    }

    const result = evaluateGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setCurrentGuess('');

    const correct = isGuessCorrect(result);

    if (correct || newGuesses.length >= maxGuesses) {
      const score = calculateHoleScore(correct, newGuesses.length, par);
      const holeResult: HoleResult = {
        holeNumber: currentHole,
        guesses: newGuesses,
        targetWord,
        solved: correct,
        score,
      };

      submitHoleResult(gameId, roundNumber, holeResult).then(loadUserResult);
      setGameOver(true);
      setSolved(correct);

      if (correct) {
        const scoreName = getScoreName(newGuesses.length, par);
        displayMessage(`${scoreName}! (${getScoreRelativeToPar(newGuesses.length, par)})`);
      } else {
        displayMessage(`The word was ${targetWord}`);
      }
    }
  }, [
    gameOver, gameId, user, currentGuess, wordLength, targetWord,
    guesses, maxGuesses, par, currentHole, roundNumber,
    submitHoleResult, displayMessage, isHoleLocked, isHolePast, loadUserResult,
  ]);

  // Physical keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEnter, handleBackspace, handleKeyPress]);

  if (!user) return null;

  if (!game || !round) {
    return (
      <div className="container py-5 text-center">
        <h3>Game not found</h3>
        <Link to="/dashboard" className="btn btn-success mt-3">Back to Dashboard</Link>
      </div>
    );
  }

  if (!game.playerIds.includes(user.id)) {
    return (
      <div className="container py-5 text-center">
        <h3>You are not a player in this game</h3>
        <Link to="/dashboard" className="btn btn-success mt-3">Back to Dashboard</Link>
      </div>
    );
  }

  const userRoundComplete = userResultCompletedAt != null;
  const keys = buildKeyboardState(guesses);

  // Find next unplayed hole that is available today
  const nextUnplayedHole = round.holes.find(
    h => !completedHoles.some(ch => ch.holeNumber === h.holeNumber) &&
      getHoleAvailability(startDate, h.holeNumber) === 'available'
  );

  // Winner picks: check if this user won the current hole and can set constraints for next
  const isWinnerPicks = round.winnerPicks === true;
  const nextHoleNumber = currentHole < round.holes.length ? currentHole + 1 : null;
  const currentUserWonHole = currentHoleResult?.solved && currentHoleResult.score === Math.min(
    ...(completedHoles.filter(h => h.holeNumber === currentHole).map(h => h.score))
  );
  const showWinnerPicksForm = isWinnerPicks && currentUserWonHole && nextHoleNumber &&
    !wpSubmitted[currentHole] && gameOver;

  const handleWinnerPicksSubmit = () => {
    if (!gameId || !nextHoleNumber) return;
    const constraints: WordConstraints = {};
    if (wpStartsWith) constraints.startsWith = wpStartsWith.toUpperCase();
    if (wpEndsWith) constraints.endsWith = wpEndsWith.toUpperCase();
    if (wpContains) constraints.contains = wpContains.toUpperCase();
    if (wpLetterPool) constraints.letterPool = wpLetterPool.toUpperCase();

    if (Object.keys(constraints).length === 0) return;

    updateHoleConstraints(gameId, roundNumber, nextHoleNumber, constraints).then(() => {
      setWpSubmitted(prev => ({ ...prev, [currentHole]: true }));
      setWpStartsWith('');
      setWpEndsWith('');
      setWpContains('');
      setWpLetterPool('');
    });
  };

  // Calculate round summary stats for the complete screen
  const totalPar = round.holes.reduce((s, h) => s + h.par, 0);
  const roundScoreRelative = completedHoles.length > 0
    ? calculateRoundScoreRelativeToPar(completedHoles, round.holes.filter(h => completedHoles.some(ch => ch.holeNumber === h.holeNumber)))
    : 0;
  const totalScore = completedHoles.reduce((s, h) => s + h.score, 0);
  const holesInOne = completedHoles.filter(h => h.solved && h.guesses.length === 1).length;
  const eagles = completedHoles.filter(h => {
    const holePar = round.holes.find(rh => rh.holeNumber === h.holeNumber)?.par || 4;
    return h.score - holePar <= -2;
  }).length;
  const birdies = completedHoles.filter(h => {
    const holePar = round.holes.find(rh => rh.holeNumber === h.holeNumber)?.par || 4;
    return h.score - holePar === -1;
  }).length;

  return (
    <div className="gameplay-page">
      {/* Mobile Header - compact, shown only on small screens */}
      <div className="gameplay-header-mobile">
        <Link to="/dashboard" className="gameplay-back-btn" aria-label="Back to dashboard">&#8249;</Link>
        <div className="gameplay-header-center">
          <span className="gameplay-title">{game.name}</span>
          <span className="gameplay-subtitle">
            {userRoundComplete ? 'Round Complete' : `Hole ${currentHole} \u00B7 Par ${par}`}
          </span>
        </div>
        <div className="gameplay-header-actions">
          <div className="d-flex gap-1">
            {completedHoles.length > 0 && (
              <Link to="/daily" className="btn btn-outline-light btn-sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                Daily
              </Link>
            )}
            {(allComplete || userRoundComplete) && (
              <Link to={`/game/${gameId}/results`} className="btn btn-outline-light btn-sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                Results
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header - full version for larger screens */}
      <div className="gameplay-header-desktop container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h4 className="mb-0 fw-bold" style={{ color: 'var(--wl-green-dark)' }}>{game.name}</h4>
            <small className="text-muted">Round {roundNumber}</small>
          </div>
          <div className="d-flex gap-2">
            {completedHoles.length > 0 && (
              <Link to="/daily" className="btn btn-outline-success btn-sm">
                Daily Board
              </Link>
            )}
            {(allComplete || userRoundComplete) && (
              <Link to={`/game/${gameId}/results`} className="btn btn-outline-success btn-sm">
                View Results
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Dashboard</Link>
          </div>
        </div>

        {/* Hole Navigator - desktop only */}
        <div className="mb-3">
          <HoleNavigator
            holes={round.holes}
            currentHole={currentHole}
            completedHoles={completedHoles}
            onSelectHole={setCurrentHole}
            startDate={startDate}
          />
        </div>
      </div>

      {/* Locked Hole Notice */}
      {isHoleLocked && (
        <div className="container">
          <div className="alert alert-warning text-center">
            <strong>Hole {currentHole} is locked.</strong>
            <br />
            This hole unlocks on {formatHoleDate(startDate, currentHole)}.
            Each hole becomes available one day at a time starting at 12:00 AM.
          </div>
        </div>
      )}

      {/* Past Hole Notice */}
      {isHolePast && (
        <div className="container">
          <div className="alert alert-secondary text-center">
            <strong>Hole {currentHole} has expired.</strong>
            <br />
            This hole was available on {formatHoleDate(startDate, currentHole)} and can no longer be played.
          </div>
        </div>
      )}

      {/* Loading word from API (Classic mode) */}
      {!isHoleLocked && !isHolePast && isClassicMode && !targetWord && !fetchFailed && (
        <div className="text-center py-5">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Fetching today's Wordle word...</p>
        </div>
      )}

      {/* Classic mode fetch failed notice (game continues with fallback word) */}
      {fetchFailed && targetWord && (
        <div className="container">
          <div className="alert alert-warning py-2 text-center small mt-2">
            Could not fetch the official Wordle word. Using a fallback word instead.
          </div>
        </div>
      )}

      {/* Mobile Hole Switcher - prev/next arrows */}
      {!isHoleLocked && !isHolePast && (!isClassicMode || targetWord) && (
        <div className="gameplay-hole-switcher">
          <button
            className="gameplay-hole-arrow"
            onClick={() => currentHole > 1 && setCurrentHole(currentHole - 1)}
            disabled={currentHole <= 1}
            aria-label="Previous hole"
          >
            &#8249;
          </button>
          <span className="gameplay-hole-label">
            Hole {currentHole} of {round.holes.length}
          </span>
          <button
            className="gameplay-hole-arrow"
            onClick={() => currentHole < round.holes.length && setCurrentHole(currentHole + 1)}
            disabled={currentHole >= round.holes.length}
            aria-label="Next hole"
          >
            &#8250;
          </button>
        </div>
      )}

      {/* Current Hole Info & Game Area */}
      {!isHoleLocked && !isHolePast && (!isClassicMode || targetWord) && (
        <div className="gameplay-area">
          {/* Hole info - desktop shows full, mobile shows minimal */}
          <div className="gameplay-hole-info text-center">
            <div className="gameplay-hole-info-desktop">
              <h5 className="mb-1">
                Hole {currentHole}
                <span className="badge bg-secondary ms-2">Par {par}</span>
                <small className="text-muted ms-2">
                  ({wordLength} letters, {maxGuesses} guesses)
                </small>
              </h5>
            </div>
            <div className="gameplay-hole-info-mobile">
              <small className="text-muted">
                {wordLength} letters &middot; {maxGuesses} guesses
              </small>
            </div>
            {isClassicMode && !currentHoleResult && (
              <small className="text-muted d-block">Classic Wordle</small>
            )}
            {hasStartWord && !currentHoleResult && (
              <small className="text-info d-block">
                Start word: <strong>{startWord}</strong>
              </small>
            )}
            {holeConfig?.wordConstraints && !currentHoleResult && (
              <small className="text-warning d-block">
                {holeConfig.wordConstraints.startsWith && `Starts with: ${holeConfig.wordConstraints.startsWith} `}
                {holeConfig.wordConstraints.endsWith && `Ends with: ${holeConfig.wordConstraints.endsWith} `}
                {holeConfig.wordConstraints.contains && `Contains: ${holeConfig.wordConstraints.contains} `}
                {holeConfig.wordConstraints.letterPool && `Pool: ${holeConfig.wordConstraints.letterPool}`}
              </small>
            )}
          </div>

          {/* Toast Message */}
          {showMessage && (
            <div className="game-toast">
              <div className="alert alert-dark py-2 px-4 fw-bold mb-0">
                {message}
              </div>
            </div>
          )}

          {/* Wordle Board */}
          <div className="gameplay-board">
            <WordleBoard
              guesses={guesses}
              currentGuess={currentGuess}
              maxGuesses={maxGuesses}
              wordLength={wordLength}
            />
          </div>

          {/* Result for this hole */}
          {gameOver && (
            <div className="text-center mt-2 mb-2">
              {solved ? (
                <span className="badge bg-success fs-6 px-3 py-2">
                  {getScoreName(guesses.length, par)} &mdash; {guesses.length} strokes
                </span>
              ) : (
                <span className="badge bg-danger fs-6 px-3 py-2">
                  DNF &mdash; The word was <strong>{targetWord}</strong>
                </span>
              )}

              <div className="mt-2 d-flex justify-content-center gap-2 flex-wrap">
                {nextUnplayedHole && nextUnplayedHole.holeNumber !== currentHole && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => setCurrentHole(nextUnplayedHole.holeNumber)}
                  >
                    Next Hole (#{nextUnplayedHole.holeNumber})
                  </button>
                )}
                <Link to="/daily" className="btn btn-outline-success btn-sm">
                  Daily Leaderboard
                </Link>
              </div>
            </div>
          )}

          {/* Winner Picks: constraint form for next hole */}
          {showWinnerPicksForm && (
            <div className="container mt-2 mb-2">
              <div className="card border-success">
                <div className="card-body py-2 px-3">
                  <p className="fw-bold text-success mb-2 small">
                    You won this hole! Set a rule for Hole {nextHoleNumber}:
                  </p>
                  <div className="row g-2 align-items-end">
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-0">Starts with</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={3}
                        value={wpStartsWith}
                        onChange={e => setWpStartsWith(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        placeholder="e.g. TR"
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-0">Ends with</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={3}
                        value={wpEndsWith}
                        onChange={e => setWpEndsWith(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        placeholder="e.g. ED"
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-0">Must contain</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={5}
                        value={wpContains}
                        onChange={e => setWpContains(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        placeholder="e.g. AE"
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label small mb-0">Letter pool</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={26}
                        value={wpLetterPool}
                        onChange={e => setWpLetterPool(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                        placeholder="e.g. ABCDEF"
                      />
                    </div>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleWinnerPicksSubmit}
                      disabled={!wpStartsWith && !wpEndsWith && !wpContains && !wpLetterPool}
                    >
                      Set Rule
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setWpSubmitted(prev => ({ ...prev, [currentHole]: true }))}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Winner picks: show constraint already set */}
          {isWinnerPicks && wpSubmitted[currentHole] && nextHoleNumber && (
            <div className="text-center mt-1 mb-1">
              <small className="text-success">Rule set for Hole {nextHoleNumber}!</small>
            </div>
          )}

          {/* Keyboard */}
          {!currentHoleResult && (
            <div className="gameplay-keyboard">
              <Keyboard
                keys={keys}
                onKeyPress={handleKeyPress}
                onEnter={handleEnter}
                onBackspace={handleBackspace}
                disabled={gameOver}
              />
            </div>
          )}
        </div>
      )}

      {/* Round Complete Summary Screen */}
      {userRoundComplete && (
        <div className="container">
          <div className="card game-card mt-3">
            <div className="card-body text-center py-4">
              <h4 className="fw-bold mb-1" style={{ color: 'var(--wl-green-dark)' }}>
                Round {roundNumber} Complete!
              </h4>
              <p className="text-muted mb-3">You finished all {completedHoles.length} holes</p>

              {/* Score Summary */}
              <div className="d-flex justify-content-center gap-4 mb-3 flex-wrap">
                <div className="text-center">
                  <div className="fs-3 fw-bold" style={{ color: 'var(--wl-green-dark)' }}>{totalScore}</div>
                  <small className="text-muted">Total Strokes</small>
                </div>
                <div className="text-center">
                  <div className="fs-3 fw-bold" style={{ color: roundScoreRelative < 0 ? 'var(--wl-birdie)' : roundScoreRelative === 0 ? 'var(--wl-par)' : 'var(--wl-bogey)' }}>
                    {roundScoreRelative === 0 ? 'E' : roundScoreRelative > 0 ? `+${roundScoreRelative}` : roundScoreRelative}
                  </div>
                  <small className="text-muted">vs Par ({totalPar})</small>
                </div>
              </div>

              {/* Scoring highlights */}
              {(holesInOne > 0 || eagles > 0 || birdies > 0) && (
                <div className="d-flex justify-content-center gap-3 mb-3">
                  {holesInOne > 0 && <span className="badge bg-warning text-dark">Holes in One: {holesInOne}</span>}
                  {eagles > 0 && <span className="badge" style={{ backgroundColor: 'var(--wl-eagle)', color: 'white' }}>Eagles: {eagles}</span>}
                  {birdies > 0 && <span className="badge" style={{ backgroundColor: 'var(--wl-birdie)', color: 'white' }}>Birdies: {birdies}</span>}
                </div>
              )}

              {/* Status and actions */}
              {allComplete ? (
                <div>
                  <p className="text-success fw-semibold mb-3">All players have finished!</p>
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Link to={`/game/${gameId}/results`} className="btn btn-success btn-lg">
                      View Leaderboard
                    </Link>
                    <Link to="/daily" className="btn btn-outline-success">
                      Daily Leaderboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-muted mb-3">Waiting for other players to finish...</p>
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Link to={`/game/${gameId}/results`} className="btn btn-success">
                      View Results So Far
                    </Link>
                    <Link to="/daily" className="btn btn-outline-success">
                      Daily Leaderboard
                    </Link>
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini Scorecard - desktop only */}
      {completedHoles.length > 0 && (
        <div className="gameplay-scorecard container mt-4">
          <h6 className="text-muted mb-2">Your Scorecard</h6>
          <GolfScorecard
            holes={round.holes}
            results={completedHoles}
          />
        </div>
      )}
    </div>
  );
}
