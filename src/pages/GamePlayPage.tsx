import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { GuessRow, HoleResult, HolePar } from '../types';
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
  buildKeyboardState,
  isGuessCorrect,
  isValidWord,
  getHoleAvailability,
  getTodaysHoleNumber,
  formatHoleDate,
} from '../utils/gameLogic';

export default function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, isAuthenticated } = useAuth();
  const {
    getGame, getWordsForRound, getStartWordsForRound, submitHoleResult, getUserResult,
    isRoundCompleteForAllPlayers,
  } = useGame();

  const [currentHole, setCurrentHole] = useState(1);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [startWordApplied, setStartWordApplied] = useState(false);

  const game = gameId ? getGame(gameId) : undefined;
  const roundNumber = game?.currentRound || 1;
  const round = game?.rounds.find(r => r.roundNumber === roundNumber);
  const words = gameId ? getWordsForRound(gameId, roundNumber) : [];
  const startWords = gameId ? getStartWordsForRound(gameId, roundNumber) : [];
  const userResult = gameId && user ? getUserResult(gameId, roundNumber, user.id) : undefined;
  const startDate = round?.startDate || '';

  const holeConfig = round?.holes.find(h => h.holeNumber === currentHole);
  const par: HolePar = holeConfig?.par || 4;
  const wordLength = getWordLengthForPar(par);
  const maxGuesses = getMaxGuessesForPar(par);
  const targetWord = words[currentHole - 1] || '';
  const startWord = startWords[currentHole - 1] || '';
  const holeStartWordMode = currentHole <= 9
    ? (round?.startWordModeFront || round?.startWordMode || 'none')
    : (round?.startWordModeBack || round?.startWordMode || 'none');
  const hasStartWord = startWord.length > 0 && holeStartWordMode !== 'none';

  const completedHoles: HoleResult[] = userResult?.holes || [];
  const currentHoleResult = completedHoles.find(h => h.holeNumber === currentHole);

  // Check hole availability
  const holeAvailability = startDate ? getHoleAvailability(startDate, currentHole) : 'available';
  const isHoleLocked = holeAvailability === 'locked';
  const isHolePast = holeAvailability === 'past' && !currentHoleResult;
  const isHolePlayable = holeAvailability === 'available' && !currentHoleResult;

  // Auto-navigate to today's hole on mount
  const hasAutoNavigated = useRef(false);
  useEffect(() => {
    if (round && !hasAutoNavigated.current) {
      hasAutoNavigated.current = true;
      const todaysHole = getTodaysHoleNumber(startDate, round.holes.length);
      if (todaysHole !== null) {
        setCurrentHole(todaysHole);
      }
    }
  }, [round, startDate]);

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
    }
  }, [currentHole, currentHoleResult]);

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
      // Auto-evaluate the start word as the first guess
      const result = evaluateGuess(startWord, targetWord);
      const newGuesses = [result];
      setGuesses(newGuesses);
      setStartWordApplied(true);

      const correct = isGuessCorrect(result);
      if (correct) {
        // Unlikely but handle: start word matches target
        const score = calculateHoleScore(true, 1, par);
        const holeResult: HoleResult = {
          holeNumber: currentHole,
          guesses: newGuesses,
          targetWord,
          solved: true,
          score,
        };
        if (gameId && user) {
          submitHoleResult(gameId, roundNumber, holeResult);
        }
        setGameOver(true);
        setSolved(true);
      }
    }
    // Reset ref when hole changes
    return () => { startWordRef.current = false; };
  }, [
    hasStartWord, isHolePlayable, startWordApplied, currentHoleResult,
    guesses.length, targetWord, startWord, par, currentHole, gameId,
    user, roundNumber, submitHoleResult,
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

      submitHoleResult(gameId, roundNumber, holeResult);
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
    submitHoleResult, displayMessage, isHoleLocked, isHolePast,
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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

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

  const allComplete = isRoundCompleteForAllPlayers(gameId!, roundNumber);
  const userRoundComplete = userResult?.completedAt != null;
  const keys = buildKeyboardState(guesses);

  // Find next unplayed hole that is available today
  const nextUnplayedHole = round.holes.find(
    h => !completedHoles.some(ch => ch.holeNumber === h.holeNumber) &&
      getHoleAvailability(startDate, h.holeNumber) === 'available'
  );

  return (
    <div className="container py-3">
      {/* Game Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold" style={{ color: 'var(--wl-green-dark)' }}>{game.name}</h4>
          <small className="text-muted">Round {roundNumber}</small>
        </div>
        <div className="d-flex gap-2">
          {allComplete && (
            <Link to={`/game/${gameId}/results`} className="btn btn-outline-success btn-sm">
              View Results
            </Link>
          )}
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Dashboard</Link>
        </div>
      </div>

      {/* Hole Navigator */}
      <div className="mb-3">
        <HoleNavigator
          holes={round.holes}
          currentHole={currentHole}
          completedHoles={completedHoles}
          onSelectHole={setCurrentHole}
          startDate={startDate}
        />
      </div>

      {/* Locked Hole Notice */}
      {isHoleLocked && (
        <div className="alert alert-warning text-center">
          <strong>Hole {currentHole} is locked.</strong>
          <br />
          This hole unlocks on {formatHoleDate(startDate, currentHole)}.
          Each hole becomes available one day at a time starting at 12:00 AM.
        </div>
      )}

      {/* Past Hole Notice */}
      {isHolePast && (
        <div className="alert alert-secondary text-center">
          <strong>Hole {currentHole} has expired.</strong>
          <br />
          This hole was available on {formatHoleDate(startDate, currentHole)} and can no longer be played.
        </div>
      )}

      {/* Current Hole Info */}
      {!isHoleLocked && !isHolePast && (
        <>
          <div className="text-center mb-2">
            <h5 className="mb-1">
              Hole {currentHole}
              <span className="badge bg-secondary ms-2">Par {par}</span>
              <small className="text-muted ms-2">
                ({wordLength} letters, {maxGuesses} guesses)
              </small>
            </h5>
            {hasStartWord && !currentHoleResult && (
              <small className="text-info">
                Start word: <strong>{startWord}</strong> (auto-played as your first guess)
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
          <WordleBoard
            guesses={guesses}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />

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

              {nextUnplayedHole && nextUnplayedHole.holeNumber !== currentHole && (
                <div className="mt-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => setCurrentHole(nextUnplayedHole.holeNumber)}
                  >
                    Next Hole (#{nextUnplayedHole.holeNumber})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Keyboard */}
          {!currentHoleResult && (
            <Keyboard
              keys={keys}
              onKeyPress={handleKeyPress}
              onEnter={handleEnter}
              onBackspace={handleBackspace}
              disabled={gameOver}
            />
          )}
        </>
      )}

      {/* Round Complete Notice */}
      {userRoundComplete && (
        <div className="alert alert-success mt-3 text-center">
          <strong>Round Complete!</strong>
          {allComplete ? (
            <span> All players have finished.{' '}
              <Link to={`/game/${gameId}/results`} className="alert-link">View Results</Link>
            </span>
          ) : (
            <span> Waiting for other players to finish...</span>
          )}
        </div>
      )}

      {/* Mini Scorecard */}
      {completedHoles.length > 0 && (
        <div className="mt-4">
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
