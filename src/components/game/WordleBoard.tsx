import { GuessRow } from '../../types';
import { createEmptyRow } from '../../utils/gameLogic';

interface WordleBoardProps {
  guesses: GuessRow[];
  currentGuess: string;
  maxGuesses: number;
  wordLength: number;
}

export default function WordleBoard({ guesses, currentGuess, maxGuesses, wordLength }: WordleBoardProps) {
  const rows: GuessRow[] = [];

  // Add completed guesses
  for (const guess of guesses) {
    rows.push(guess);
  }

  // Add current guess row if game is still active
  if (guesses.length < maxGuesses) {
    const currentRow = createEmptyRow(wordLength);
    for (let i = 0; i < currentGuess.length && i < wordLength; i++) {
      currentRow[i] = { letter: currentGuess[i].toUpperCase(), status: 'empty' };
    }
    rows.push(currentRow);
  }

  // Fill remaining rows with empty
  while (rows.length < maxGuesses) {
    rows.push(createEmptyRow(wordLength));
  }

  return (
    <div className="wordle-board">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="wordle-row">
          {row.map((tile, tileIdx) => {
            const isCurrentRow = rowIdx === guesses.length;
            const hasLetter = tile.letter !== '';
            const statusClass = tile.status !== 'empty' ? tile.status : '';
            const popClass = isCurrentRow && hasLetter ? 'has-letter' : '';
            const flipClass = rowIdx < guesses.length && tile.status !== 'empty' ? 'flip' : '';

            return (
              <div
                key={tileIdx}
                className={`wordle-tile ${statusClass} ${popClass} ${flipClass}`}
                style={flipClass ? { animationDelay: `${tileIdx * 0.15}s` } : undefined}
              >
                {tile.letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
