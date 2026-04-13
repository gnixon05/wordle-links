/**
 * Test suite for game logic functions.
 * Run with: npx tsx tests/gameLogic.test.ts
 */

// Import game logic functions
import {
  evaluateGuess,
  getWordLengthForPar,
  getMaxGuessesForPar,
  calculateHoleScore,
  getScoreName,
  filterByConstraints,
  pickWordForHole,
  generateRoundWords,
  generateFallbackClassicWord,
  seededRandom,
} from '../src/utils/gameLogic.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}

// --- evaluateGuess ---
console.log('\n--- evaluateGuess ---');

const result1 = evaluateGuess('CRANE', 'CRANE');
assert(result1.every(l => l.status === 'correct'), 'exact match returns all correct');

const result2 = evaluateGuess('ABCDE', 'FGHIJ');
assert(result2.every(l => l.status === 'absent'), 'no match returns all absent');

const result3 = evaluateGuess('CRANE', 'REACT');
assert(result3[0].status === 'present', 'C in wrong position = present');
assert(result3[1].status === 'present', 'R in wrong position = present');
assert(result3[2].status === 'correct', 'A in correct position = correct');
assert(result3[3].status === 'absent', 'N not in REACT = absent');
assert(result3[4].status === 'present', 'E in wrong position = present');

// --- getWordLengthForPar ---
console.log('\n--- getWordLengthForPar ---');
assert(getWordLengthForPar(3) === 4, 'Par 3 → 4 letters');
assert(getWordLengthForPar(4) === 5, 'Par 4 → 5 letters');
assert(getWordLengthForPar(5) === 6, 'Par 5 → 6 letters');

// --- getMaxGuessesForPar ---
console.log('\n--- getMaxGuessesForPar ---');
assert(getMaxGuessesForPar(3) === 5, 'Par 3 → 5 guesses');
assert(getMaxGuessesForPar(4) === 6, 'Par 4 → 6 guesses');
assert(getMaxGuessesForPar(5) === 7, 'Par 5 → 7 guesses');

// --- calculateHoleScore ---
console.log('\n--- calculateHoleScore ---');
assert(calculateHoleScore(true, 1, 4) === 1, 'Hole in one = 1');
assert(calculateHoleScore(true, 4, 4) === 4, 'Par = par value');
assert(calculateHoleScore(false, 6, 4) === 7, 'DNF = max guesses + 1');

// --- getScoreName ---
console.log('\n--- getScoreName ---');
assert(getScoreName(1, 4) === 'Hole in One!', '1 stroke = Hole in One');
assert(getScoreName(2, 4) === 'Eagle', '2 under par = Eagle');
assert(getScoreName(3, 4) === 'Birdie', '1 under par = Birdie');
assert(getScoreName(4, 4) === 'Par', 'par = Par');
assert(getScoreName(5, 4) === 'Bogey', '1 over par = Bogey');

// --- filterByConstraints ---
console.log('\n--- filterByConstraints ---');

const testWords = ['CRANE', 'TRACK', 'STEAK', 'CREAM', 'TRADE', 'BRAVE', 'CREEK'];

assert(
  filterByConstraints(testWords, { startsWith: 'CR' }).length === 3,
  'startsWith CR finds 3 words (CRANE, CREAM, CREEK)'
);

assert(
  filterByConstraints(testWords, { endsWith: 'AK' }).length === 1,
  'endsWith AK finds 1 word (STEAK)'
);

const containsAE = filterByConstraints(testWords, { contains: 'AE' });
assert(
  containsAE.length === 5,
  `contains A and E finds 5 words (CRANE, STEAK, CREAM, TRADE, BRAVE), got ${containsAE.length}`
);

assert(
  filterByConstraints(testWords, { startsWith: 'TR', endsWith: 'DE' }).length === 1,
  'startsWith TR + endsWith DE finds 1 word (TRADE)'
);

assert(
  filterByConstraints(testWords, undefined).length === testWords.length,
  'no constraints returns all words'
);

const poolResult = filterByConstraints(['ABCD', 'ABED', 'FACE'], { letterPool: 'ABCDE' });
assert(poolResult.length === 2, 'letterPool ABCDE excludes FACE');

// --- pickWordForHole with constraints ---
console.log('\n--- pickWordForHole with constraints ---');

const word1 = pickWordForHole('golf', 4, [], undefined, { startsWith: 'D' });
assert(word1.startsWith('D'), 'pickWordForHole with startsWith D returns word starting with D');

const word2 = pickWordForHole('golf', 4, [], undefined, { endsWith: 'E' });
assert(word2.endsWith('E'), 'pickWordForHole with endsWith E returns word ending with E');

// --- generateRoundWords ---
console.log('\n--- generateRoundWords ---');

const holes = Array.from({ length: 18 }, (_, i) => ({
  holeNumber: i + 1,
  par: 4 as const,
}));
const roundWords = generateRoundWords(holes, 'golf', 'golf');
assert(roundWords.length === 18, 'generates 18 words');
assert(new Set(roundWords).size === roundWords.length, 'all words are unique');
assert(roundWords.every(w => w.length === 5), 'all words are 5 letters (Par 4)');

// --- generateFallbackClassicWord ---
console.log('\n--- generateFallbackClassicWord ---');

const fallback1 = generateFallbackClassicWord('2026-04-13');
const fallback2 = generateFallbackClassicWord('2026-04-13');
const fallback3 = generateFallbackClassicWord('2026-04-14');
assert(fallback1 === fallback2, 'same date produces same fallback word (deterministic)');
assert(fallback1.length === 5, 'fallback word is 5 letters');
// Different dates should ideally produce different words, but with hash collisions it's possible
// Just verify they're both valid 5-letter words
assert(fallback3.length === 5, 'different date also produces 5-letter word');

// --- seededRandom ---
console.log('\n--- seededRandom ---');

const r1 = seededRandom('test-seed-1');
const r2 = seededRandom('test-seed-1');
const r3 = seededRandom('test-seed-2');
assert(r1 === r2, 'same seed gives same random');
assert(r1 !== r3, 'different seed gives different random');
assert(r1 >= 0 && r1 < 1, 'random is between 0 and 1');

// --- Wordle fetch test ---
console.log('\n--- fetchDailyWordleWord (network test) ---');

async function testFetch() {
  const { fetchDailyWordleWord } = await import('../src/utils/gameLogic.js');

  console.log('  Testing fetch for 2025-01-15...');
  const word = await fetchDailyWordleWord('2025-01-15', 0); // 0 retries for quick test

  if (word) {
    assert(word.length === 5, `fetched word is 5 letters: ${word}`);
    assert(/^[A-Z]+$/.test(word), 'fetched word is uppercase alpha');
    console.log(`  ✓ Successfully fetched word (${word.length} letters)`);
  } else {
    console.log('  ⚠ Fetch returned null (network unavailable or NYT API blocked)');
    console.log('  → The fallback mechanism will generate a deterministic word instead');
    const fallback = generateFallbackClassicWord('2025-01-15');
    assert(fallback.length === 5, `fallback word is 5 letters: ${fallback}`);
  }
}

await testFetch();

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
