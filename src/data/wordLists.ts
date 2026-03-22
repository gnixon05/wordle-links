// Golf-themed and general word lists organized by length
// Expanded valid guess word lists are imported from separate files
import { EXPANDED_VALID_4 } from './validGuessWords4';
import { EXPANDED_VALID_5 } from './validGuessWords5';
import { EXPANDED_VALID_6 } from './validGuessWords6';

export const GOLF_WORDS_4: string[] = [
  'CLUB', 'IRON', 'PUTT', 'HOOK', 'DRAW', 'FADE', 'CHIP', 'HOLE', 'FLAG',
  'FORE', 'LOFT', 'GRIP', 'CART', 'SAND', 'TRAP', 'DUFF', 'YIPS', 'SPIN',
  'BALL', 'PINE', 'PLAY', 'WING', 'TOPS', 'YARD', 'BACK', 'FLAT', 'LIFT',
  'DROP', 'LINE', 'LONG', 'MARK', 'MOVE', 'OPEN', 'PACE', 'PICK', 'POST',
  'PULL', 'PUSH', 'REED', 'ROLL', 'SHOT', 'SINK', 'TEED', 'TURN', 'WOOD',
];

export const GOLF_WORDS_5: string[] = [
  'LINKS', 'DRIVE', 'GREEN', 'WEDGE', 'BOGEY', 'EAGLE', 'BIRDY', 'DIVOT',
  'SLICE', 'PITCH', 'ROUGH', 'BUNKE', 'SWING', 'ROUND', 'PUTTS', 'SHANK',
  'WOODS', 'IRONS', 'PINES', 'CADDY', 'TIGER', 'CLUBS', 'HOOKS', 'DRAWS',
  'FADES', 'CHIPS', 'HOLES', 'FLAGS', 'GRIPS', 'CARTS', 'TRAPS', 'BALLS',
  'SPINS', 'YARDS', 'SCORE', 'MATCH', 'MAJOR', 'APRON', 'BREAK', 'CARRY',
  'FLIER', 'GRAIN', 'LAYUP', 'PUNCH', 'SCUFF', 'SHAVE', 'SKULL', 'STIFF',
  'CHUNK', 'FLYER', 'GRASS', 'SWEET', 'TRACK', 'UNDER', 'WATER',
];

export const GOLF_WORDS_6: string[] = [
  'BIRDIE', 'DRIVER', 'PUTTER', 'BUNKER', 'HAZARD', 'COURSE', 'GREENS',
  'STROKE', 'DOUBLE', 'MULLIG', 'WEDGES', 'DIMPLE', 'DOGLEG', 'EAGLES',
  'FLANGE', 'HYBRID', 'IMPACT', 'MARKER', 'NASSAU', 'OFFSET', 'PLAYER',
  'STANCE', 'SWINGS', 'TARGET', 'TOPPED', 'UPHILL', 'WAGGLE', 'FESCUE',
  'PITCHE', 'RESCUE', 'SCRAMB', 'SKULLS', 'CHUNKS', 'DRIVES', 'ROUNDS',
  'SCORES', 'CADDIE', 'UNPLAY', 'MENTAL', 'CLUTCH', 'SPIRAL', 'GALLON',
  'TROPHY', 'TOURNA', 'CHAMPS', 'MASTER',
];

// Themed word lists
export const SPORTS_WORDS_4 = ['GAME', 'TEAM', 'BALL', 'GOAL', 'RACE', 'JUMP', 'KICK', 'PASS', 'RUNS', 'WINS', 'PLAY', 'DUNK', 'SURF', 'LAPS', 'NETS'];
export const SPORTS_WORDS_5 = ['COACH', 'SCORE', 'FIELD', 'MATCH', 'TRACK', 'SERVE', 'COURT', 'PITCH', 'MEDAL', 'DRAFT', 'RALLY', 'ARENA', 'CHASE', 'CATCH', 'THROW'];
export const SPORTS_WORDS_6 = ['TACKLE', 'SPRINT', 'GOALIE', 'TROPHY', 'SPORTS', 'LEAGUE', 'PLAYER', 'FINALS', 'SEASON', 'SERIES', 'DIVING', 'BOXING', 'TENNIS', 'HOCKEY', 'BASKET'];

export const NATURE_WORDS_4 = ['TREE', 'LAKE', 'WIND', 'RAIN', 'PINE', 'LEAF', 'HILL', 'PEAK', 'POND', 'ROCK', 'FERN', 'DOVE', 'FISH', 'DEER', 'HAWK'];
export const NATURE_WORDS_5 = ['CREEK', 'WOODS', 'GRASS', 'RIVER', 'OCEAN', 'STONE', 'BLOOM', 'EAGLE', 'MAPLE', 'CEDAR', 'MARSH', 'RIDGE', 'TRAIL', 'CLOUD', 'STORM'];
export const NATURE_WORDS_6 = ['FOREST', 'STREAM', 'MEADOW', 'VALLEY', 'CANYON', 'ISLAND', 'DESERT', 'SUNSET', 'ALPINE', 'BREEZE', 'GLACIE', 'AUTUMN', 'SPRING', 'BLOSSO', 'GARDEN'];

export const FOOD_WORDS_4 = ['CAKE', 'CORN', 'FISH', 'LIME', 'MEAT', 'RICE', 'PLUM', 'PORK', 'TACO', 'WRAP', 'HERB', 'SALT', 'WINE', 'BREW', 'STEW'];
export const FOOD_WORDS_5 = ['BREAD', 'STEAK', 'PASTA', 'SALAD', 'CREAM', 'HONEY', 'SAUCE', 'LEMON', 'PEACH', 'BASIL', 'MAPLE', 'OLIVE', 'ROAST', 'MELON', 'BERRY'];
export const FOOD_WORDS_6 = ['CHEESE', 'BUTTER', 'COFFEE', 'MUFFIN', 'BRISKET', 'PASTRY', 'COOKIE', 'GINGER', 'PEPPER', 'CELERY', 'GARLIC', 'TURNIP', 'RADISH', 'SALMON', 'TURKEY'];

export const ANIMAL_WORDS_4 = ['BEAR', 'BIRD', 'DEER', 'DUCK', 'FISH', 'FROG', 'GOAT', 'HAWK', 'LION', 'MOLE', 'PUMA', 'SEAL', 'SWAN', 'WOLF', 'WREN'];
export const ANIMAL_WORDS_5 = ['EAGLE', 'HORSE', 'MOOSE', 'OTTER', 'RAVEN', 'SHARK', 'SNAKE', 'TIGER', 'WHALE', 'ZEBRA', 'BISON', 'CRANE', 'FINCH', 'GECKO', 'LLAMA'];
export const ANIMAL_WORDS_6 = ['BADGER', 'CONDOR', 'COYOTE', 'FALCON', 'FERRET', 'GOPHER', 'JAGUAR', 'LIZARD', 'OSPREY', 'PARROT', 'PELICA', 'RABBIT', 'SALMON', 'TURTLE', 'WALRUS'];

// General valid word lists for custom game target word selection.
// These use the ENABLE dictionary (https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt)
// which provides comprehensive, officially accepted English words.
export const VALID_WORDS_4: string[] = EXPANDED_VALID_4;

export const VALID_WORDS_5: string[] = EXPANDED_VALID_5;

export const VALID_WORDS_6: string[] = EXPANDED_VALID_6;

export function getWordListByLength(length: number): string[] {
  switch (length) {
    case 4: return VALID_WORDS_4;
    case 5: return VALID_WORDS_5;
    case 6: return VALID_WORDS_6;
    default: return VALID_WORDS_5;
  }
}

// Build Sets for O(1) guess validation using ENABLE word lists
// Also includes themed words so they are always accepted as guesses
const VALID_GUESS_SET_4 = new Set([...EXPANDED_VALID_4, ...GOLF_WORDS_4, ...SPORTS_WORDS_4, ...NATURE_WORDS_4, ...FOOD_WORDS_4, ...ANIMAL_WORDS_4]);
const VALID_GUESS_SET_5 = new Set([...EXPANDED_VALID_5, ...GOLF_WORDS_5, ...SPORTS_WORDS_5, ...NATURE_WORDS_5, ...FOOD_WORDS_5, ...ANIMAL_WORDS_5]);
const VALID_GUESS_SET_6 = new Set([...EXPANDED_VALID_6, ...GOLF_WORDS_6, ...SPORTS_WORDS_6, ...NATURE_WORDS_6, ...FOOD_WORDS_6, ...ANIMAL_WORDS_6]);

/**
 * Check if a word is a valid guess.
 * Uses the expanded word lists for comprehensive coverage of English words.
 */
export function isValidGuess(word: string, length: number): boolean {
  const upper = word.toUpperCase();
  switch (length) {
    case 4: return VALID_GUESS_SET_4.has(upper);
    case 5: return VALID_GUESS_SET_5.has(upper);
    case 6: return VALID_GUESS_SET_6.has(upper);
    default: return VALID_GUESS_SET_5.has(upper);
  }
}

/**
 * Filter out words that are likely plurals (ending in 'S').
 * Used when selecting target/secret words to avoid plural answers.
 */
export function filterNonPlurals(words: string[]): string[] {
  return words.filter(w => !w.endsWith('S'));
}

export function getThemedWords(theme: string, length: number): string[] {
  const themeMap: Record<string, Record<number, string[]>> = {
    golf: { 4: GOLF_WORDS_4, 5: GOLF_WORDS_5, 6: GOLF_WORDS_6 },
    sports: { 4: SPORTS_WORDS_4, 5: SPORTS_WORDS_5, 6: SPORTS_WORDS_6 },
    nature: { 4: NATURE_WORDS_4, 5: NATURE_WORDS_5, 6: NATURE_WORDS_6 },
    food: { 4: FOOD_WORDS_4, 5: FOOD_WORDS_5, 6: FOOD_WORDS_6 },
    animals: { 4: ANIMAL_WORDS_4, 5: ANIMAL_WORDS_5, 6: ANIMAL_WORDS_6 },
  };

  if (theme === 'random' || theme === 'custom') {
    return getWordListByLength(length);
  }

  return themeMap[theme]?.[length] || getWordListByLength(length);
}

/**
 * Get themed words filtered to exclude plurals.
 * Use this when selecting target/secret words for holes.
 */
export function getThemedWordsForTarget(theme: string, length: number): string[] {
  return filterNonPlurals(getThemedWords(theme, length));
}

/**
 * Get word list by length filtered to exclude plurals.
 * Use this when selecting target/secret words.
 */
export function getWordListByLengthForTarget(length: number): string[] {
  return filterNonPlurals(getWordListByLength(length));
}
