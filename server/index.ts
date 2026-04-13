import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '5mb' }));

// Serve static files from the Vite build output
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Initialize database tables
initializeDatabase();
console.log('[Server] Database initialized');

// ---------- Helper: session auth middleware ----------

type AuthedRequest = express.Request & { userId: string };

function getSessionUserId(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const sessionId = authHeader.slice(7);

  const session = db.prepare(
    `SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')`
  ).get(sessionId) as { user_id: string } | undefined;

  return session?.user_id ?? null;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const userId = getSessionUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

// ---------- Auth endpoints ----------

app.post('/api/auth/signup', (req, res) => {
  const { firstName, lastName, email, password, nickname, avatar } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'An account with that email already exists.' });
    return;
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  const avatarCategory = avatar?.category || 'golfball';
  const avatarVariant = avatar?.variant || 'white';

  db.prepare(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, nickname, avatar_category, avatar_variant)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, firstName, lastName, email, passwordHash, nickname || null, avatarCategory, avatarVariant);

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, id, expiresAt);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, string>;

  res.status(201).json({
    sessionId,
    user: formatUser(user),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, string> | undefined;
  if (!user) {
    res.status(401).json({ error: 'No account found with that email.' });
    return;
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, user.id, expiresAt);

  res.json({
    sessionId,
    user: formatUser(user),
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const sessionId = authHeader.slice(7);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const userId = getSessionUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as Record<string, string> | undefined;
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  res.json({ user: formatUser(user) });
});

// ---------- User endpoints ----------

app.get('/api/users', (_req, res) => {
  const users = db.prepare('SELECT * FROM users').all() as Record<string, string>[];
  res.json(users.map(formatUser));
});

app.get('/api/users/:id', (_req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(_req.params.id) as Record<string, string> | undefined;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(formatUser(user));
});

app.patch('/api/users/:id', requireAuth, (req, res) => {
  const authedReq = req as AuthedRequest;
  if (authedReq.userId !== req.params.id) {
    res.status(403).json({ error: 'Cannot update another user\'s profile' });
    return;
  }

  const { firstName, lastName, nickname, avatar, theme } = req.body;
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (firstName !== undefined) { updates.push('first_name = ?'); values.push(firstName); }
  if (lastName !== undefined) { updates.push('last_name = ?'); values.push(lastName); }
  if (nickname !== undefined) { updates.push('nickname = ?'); values.push(nickname || null); }
  if (avatar?.category !== undefined) { updates.push('avatar_category = ?'); values.push(avatar.category); }
  if (avatar?.variant !== undefined) { updates.push('avatar_variant = ?'); values.push(avatar.variant); }
  if (theme !== undefined) { updates.push('theme = ?'); values.push(theme); }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(req.params.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as Record<string, string>;
  res.json(formatUser(user));
});

// ---------- Game endpoints ----------

app.get('/api/games', (_req, res) => {
  const games = db.prepare('SELECT * FROM games ORDER BY created_at DESC').all() as Record<string, unknown>[];
  res.json(games.map(g => formatGame(g)));
});

app.get('/api/games/:id', (_req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(_req.params.id) as Record<string, unknown> | undefined;
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  res.json(formatGame(game));
});

app.post('/api/games', requireAuth, (req, res) => {
  const authedReq = req as AuthedRequest;
  const { game, words, startWords } = req.body;

  if (!game) {
    res.status(400).json({ error: 'Game data required' });
    return;
  }

  // Insert game
  db.prepare(
    `INSERT INTO games (id, name, creator_id, visibility, password, current_round, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(game.id, game.name, authedReq.userId, game.visibility, game.password || null, game.currentRound, game.createdAt);

  // Insert creator as player
  db.prepare('INSERT INTO game_players (game_id, user_id, role) VALUES (?, ?, ?)').run(game.id, authedReq.userId, 'creator');

  // Insert invited users
  if (game.invitedUserIds?.length) {
    const insertInvite = db.prepare('INSERT OR IGNORE INTO game_invitations (game_id, user_id) VALUES (?, ?)');
    for (const uid of game.invitedUserIds) {
      insertInvite.run(game.id, uid);
    }
  }

  // Insert rounds
  if (game.rounds?.length) {
    const insertRound = db.prepare(
      `INSERT INTO rounds (game_id, round_number, holes_json, word_mode, front_nine_theme, back_nine_theme, start_date,
       start_word_mode_front, start_word_mode_back, start_word_theme_front, start_word_theme_back, winner_picks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const round of game.rounds) {
      insertRound.run(
        game.id, round.roundNumber, JSON.stringify(round.holes || []),
        round.wordMode || 'custom',
        round.frontNineTheme || null, round.backNineTheme || null, round.startDate,
        round.startWordModeFront || null, round.startWordModeBack || null,
        round.startWordThemeFront || null, round.startWordThemeBack || null,
        round.winnerPicks ? 1 : 0
      );
    }
  }

  // Store words
  if (words) {
    db.prepare(
      `INSERT OR REPLACE INTO game_words (game_id, round_number, words_json) VALUES (?, ?, ?)`
    ).run(game.id, 1, JSON.stringify(words));
  }

  // Store start words
  if (startWords?.length) {
    db.prepare(
      `INSERT OR REPLACE INTO game_start_words (game_id, round_number, words_json) VALUES (?, ?, ?)`
    ).run(game.id, 1, JSON.stringify(startWords));
  }

  // Return the full game
  const saved = db.prepare('SELECT * FROM games WHERE id = ?').get(game.id) as Record<string, unknown>;
  res.status(201).json(formatGame(saved));
});

app.patch('/api/games/:id', requireAuth, (req, res) => {
  const { playerIds, invitedUserIds, currentRound, rounds } = req.body;
  const gameId = req.params.id;

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  if (currentRound !== undefined) {
    db.prepare('UPDATE games SET current_round = ? WHERE id = ?').run(currentRound, gameId);
  }

  // Sync players
  if (playerIds) {
    db.prepare('DELETE FROM game_players WHERE game_id = ?').run(gameId);
    const insert = db.prepare('INSERT OR IGNORE INTO game_players (game_id, user_id, role) VALUES (?, ?, ?)');
    for (const pid of playerIds) {
      insert.run(gameId, pid, 'player');
    }
  }

  // Sync invitations
  if (invitedUserIds !== undefined) {
    db.prepare('DELETE FROM game_invitations WHERE game_id = ?').run(gameId);
    const insert = db.prepare('INSERT OR IGNORE INTO game_invitations (game_id, user_id) VALUES (?, ?)');
    for (const uid of invitedUserIds) {
      insert.run(gameId, uid);
    }
  }

  // Add new rounds
  if (rounds) {
    for (const round of rounds) {
      db.prepare(
        `INSERT OR REPLACE INTO rounds (game_id, round_number, holes_json, word_mode, front_nine_theme, back_nine_theme, start_date,
         start_word_mode_front, start_word_mode_back, start_word_theme_front, start_word_theme_back)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        gameId, round.roundNumber, JSON.stringify(round.holes || []),
        round.wordMode || 'custom',
        round.frontNineTheme || null, round.backNineTheme || null, round.startDate,
        round.startWordModeFront || null, round.startWordModeBack || null,
        round.startWordThemeFront || null, round.startWordThemeBack || null
      );
    }
  }

  const updated = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Record<string, unknown>;
  res.json(formatGame(updated));
});

app.delete('/api/games/:id', requireAuth, (req, res) => {
  const authedReq = req as AuthedRequest;
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id) as Record<string, string> | undefined;
  if (!game) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  if (game.creator_id !== authedReq.userId) {
    res.status(403).json({ error: 'Only the creator can delete a game' });
    return;
  }
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---------- Game Words endpoints ----------

app.get('/api/games/:gameId/words/:roundNumber', (_req, res) => {
  const row = db.prepare('SELECT words_json FROM game_words WHERE game_id = ? AND round_number = ?')
    .get(_req.params.gameId, parseInt(_req.params.roundNumber)) as { words_json: string } | undefined;
  res.json(row ? JSON.parse(row.words_json) : []);
});

app.put('/api/games/:gameId/words/:roundNumber', requireAuth, (req, res) => {
  const { words } = req.body;
  db.prepare(
    `INSERT OR REPLACE INTO game_words (game_id, round_number, words_json) VALUES (?, ?, ?)`
  ).run(req.params.gameId, parseInt(req.params.roundNumber), JSON.stringify(words));
  res.json({ success: true });
});

// ---------- Game Start Words endpoints ----------

app.get('/api/games/:gameId/start-words/:roundNumber', (_req, res) => {
  const row = db.prepare('SELECT words_json FROM game_start_words WHERE game_id = ? AND round_number = ?')
    .get(_req.params.gameId, parseInt(_req.params.roundNumber)) as { words_json: string } | undefined;
  res.json(row ? JSON.parse(row.words_json) : []);
});

app.put('/api/games/:gameId/start-words/:roundNumber', requireAuth, (req, res) => {
  const { words } = req.body;
  db.prepare(
    `INSERT OR REPLACE INTO game_start_words (game_id, round_number, words_json) VALUES (?, ?, ?)`
  ).run(req.params.gameId, parseInt(req.params.roundNumber), JSON.stringify(words));
  res.json({ success: true });
});

// ---------- Round Results endpoints ----------

app.get('/api/results', (_req, res) => {
  const rows = db.prepare('SELECT * FROM round_results').all() as Record<string, unknown>[];
  res.json(rows.map(formatRoundResult));
});

app.get('/api/games/:gameId/results', (_req, res) => {
  const rows = db.prepare('SELECT * FROM round_results WHERE game_id = ?')
    .all(_req.params.gameId) as Record<string, unknown>[];
  res.json(rows.map(formatRoundResult));
});

app.get('/api/games/:gameId/results/:roundNumber/:userId', (req, res) => {
  const { gameId, roundNumber, userId } = req.params;
  const row = db.prepare(
    'SELECT * FROM round_results WHERE game_id = ? AND round_number = ? AND user_id = ?'
  ).get(gameId, parseInt(roundNumber), userId) as Record<string, unknown> | undefined;
  if (!row) {
    res.json(null);
    return;
  }

  const result = formatRoundResult(row);

  // If the requesting user is different from the target user,
  // check whether the requester has completed each hole.
  // Strip guess letters for holes the requester hasn't played yet
  // so that the answer isn't revealed on the daily leaderboard.
  const requestingUserId = getSessionUserId(req);
  if (requestingUserId && requestingUserId !== userId) {
    const requesterRow = db.prepare(
      'SELECT * FROM round_results WHERE game_id = ? AND round_number = ? AND user_id = ?'
    ).get(gameId, parseInt(roundNumber), requestingUserId) as Record<string, unknown> | undefined;

    const requesterHoles: Set<number> = new Set();
    if (requesterRow) {
      const requesterResult = formatRoundResult(requesterRow);
      for (const hole of requesterResult.holes) {
        requesterHoles.add(hole.holeNumber);
      }
    }

    result.holes = result.holes.map((hole: { holeNumber: number; guesses: { letter: string; status: string }[][]; solved: boolean; score: number; targetWord: string }) => {
      if (!requesterHoles.has(hole.holeNumber)) {
        return {
          ...hole,
          targetWord: '',
          guesses: hole.guesses.map((row: { letter: string; status: string }[]) =>
            row.map(() => ({ letter: '', status: 'empty' }))
          ),
        };
      }
      return hole;
    });
  }

  res.json(result);
});

app.get('/api/users/:userId/results', (_req, res) => {
  const rows = db.prepare('SELECT * FROM round_results WHERE user_id = ?')
    .all(_req.params.userId) as Record<string, unknown>[];
  res.json(rows.map(formatRoundResult));
});

app.put('/api/results', requireAuth, (req, res) => {
  const result = req.body;

  db.prepare(
    `INSERT OR REPLACE INTO round_results (game_id, round_number, user_id, holes_json, total_score, completed_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    result.gameId,
    result.roundNumber,
    result.userId,
    JSON.stringify(result.holes),
    result.totalScore,
    result.completedAt || null,
  );

  res.json({ success: true });
});

// ---------- Wordle Imported Stats endpoints ----------

app.get('/api/users/:userId/wordle-stats', (_req, res) => {
  const row = db.prepare('SELECT * FROM wordle_imported_stats WHERE user_id = ?')
    .get(_req.params.userId) as Record<string, unknown> | undefined;
  if (!row) {
    res.json(null);
    return;
  }
  res.json(formatWordleStats(row));
});

app.put('/api/users/:userId/wordle-stats', requireAuth, (req, res) => {
  const authedReq = req as AuthedRequest;
  if (authedReq.userId !== req.params.userId) {
    res.status(403).json({ error: 'Cannot update another user\'s stats' });
    return;
  }

  const stats = req.body;
  db.prepare(
    `INSERT OR REPLACE INTO wordle_imported_stats
     (user_id, games_played, games_won, current_streak, max_streak, guess_distribution_json, imported_at, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.params.userId,
    stats.gamesPlayed,
    stats.gamesWon,
    stats.currentStreak,
    stats.maxStreak,
    JSON.stringify(stats.guessDistribution),
    stats.importedAt || new Date().toISOString(),
    stats.source || 'manual',
  );

  res.json({ success: true });
});

app.delete('/api/users/:userId/wordle-stats', requireAuth, (req, res) => {
  const authedReq = req as AuthedRequest;
  if (authedReq.userId !== req.params.userId) {
    res.status(403).json({ error: 'Cannot delete another user\'s stats' });
    return;
  }
  db.prepare('DELETE FROM wordle_imported_stats WHERE user_id = ?').run(req.params.userId);
  res.json({ success: true });
});

// ---------- Wordle NYT Proxy ----------

app.get('/api/wordle/:date.json', async (req, res) => {
  const dateStr = req.params.date;

  // Validate date format to prevent path traversal
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    return;
  }

  const nytUrl = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(nytUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Wordle Proxy] NYT responded ${response.status} for ${dateStr} (attempt ${attempt + 1})`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        res.status(response.status).json({ error: `NYT API returned ${response.status}` });
        return;
      }

      const data = await response.json();
      res.json(data);
      return;
    } catch (err) {
      console.error(`[Wordle Proxy] Error fetching ${dateStr} (attempt ${attempt + 1}):`, err);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      res.status(502).json({ error: 'Failed to fetch from NYT API after retries' });
    }
  }
});

// ---------- Finalize Completed Games ----------

/**
 * Parse a date string (YYYY-MM-DD or ISO) to a local-midnight Date object (server-side version)
 */
function parseLocalDate(dateStr: string): Date {
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getHoleAvailableDate(startDate: string, holeNumber: number): Date {
  const start = parseLocalDate(startDate);
  start.setDate(start.getDate() + (holeNumber - 1));
  return start;
}

function getMaxGuessesForPar(par: number): number {
  switch (par) {
    case 3: return 5;
    case 4: return 6;
    case 5: return 7;
    default: return 6;
  }
}

function calculateHoleScore(solved: boolean, guessCount: number, par: number): number {
  if (solved) return guessCount;
  return getMaxGuessesForPar(par) + 1;
}

app.post('/api/games/finalize-completed', (_req, res) => {
  const today = parseLocalDate(getTodayDateString());
  const todayTime = today.getTime();

  // Find all active games
  const activeGames = db.prepare("SELECT * FROM games WHERE status = 'active'").all() as Record<string, unknown>[];
  const finalized: string[] = [];

  for (const game of activeGames) {
    const gameId = game.id as string;
    const currentRound = game.current_round as number;

    // Get the current round config
    const roundRow = db.prepare('SELECT * FROM rounds WHERE game_id = ? AND round_number = ?')
      .get(gameId, currentRound) as Record<string, unknown> | undefined;

    if (!roundRow) continue;

    const startDate = roundRow.start_date as string;
    const holes: { holeNumber: number; par: number }[] = JSON.parse(roundRow.holes_json as string || '[]');

    if (holes.length === 0) continue;

    // Check if ALL holes are past (the last hole's date must be before today)
    const lastHoleNumber = Math.max(...holes.map(h => h.holeNumber));
    const lastHoleDate = getHoleAvailableDate(startDate, lastHoleNumber);
    if (todayTime <= lastHoleDate.getTime()) continue; // Not all holes have expired yet

    // All holes are past — finalize this game
    // Get all players
    const players = db.prepare('SELECT user_id FROM game_players WHERE game_id = ?')
      .all(gameId) as { user_id: string }[];

    // Get the words for this round
    const wordsRow = db.prepare('SELECT words_json FROM game_words WHERE game_id = ? AND round_number = ?')
      .get(gameId, currentRound) as { words_json: string } | undefined;
    const words: string[] = wordsRow ? JSON.parse(wordsRow.words_json) : [];

    // For each player, auto-score any missing holes
    for (const player of players) {
      const resultRow = db.prepare(
        'SELECT * FROM round_results WHERE game_id = ? AND round_number = ? AND user_id = ?'
      ).get(gameId, currentRound, player.user_id) as Record<string, unknown> | undefined;

      let existingHoles: { holeNumber: number; guesses: unknown[]; targetWord: string; solved: boolean; score: number }[] = [];
      let totalScore = 0;

      if (resultRow) {
        existingHoles = JSON.parse(resultRow.holes_json as string || '[]');
        totalScore = resultRow.total_score as number;

        // If already completed, skip
        if (resultRow.completed_at) continue;
      }

      const playedHoles = new Set(existingHoles.map(h => h.holeNumber));
      let scored = false;

      for (const hole of holes) {
        if (playedHoles.has(hole.holeNumber)) continue;

        // This hole was missed — auto-DNF
        const maxGuesses = getMaxGuessesForPar(hole.par);
        const dnfScore = calculateHoleScore(false, maxGuesses, hole.par);
        const targetWord = words[hole.holeNumber - 1] || 'XXXXX';

        existingHoles.push({
          holeNumber: hole.holeNumber,
          guesses: [],
          targetWord,
          solved: false,
          score: dnfScore,
        });
        scored = true;
      }

      // Sort holes and recalculate total
      existingHoles.sort((a, b) => a.holeNumber - b.holeNumber);
      totalScore = existingHoles.reduce((sum, h) => sum + h.score, 0);

      const completedAt = new Date().toISOString();

      // Save the finalized result
      db.prepare(
        `INSERT OR REPLACE INTO round_results (game_id, round_number, user_id, holes_json, total_score, completed_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(gameId, currentRound, player.user_id, JSON.stringify(existingHoles), totalScore, completedAt);

      if (scored) {
        console.log(`[Finalize] Auto-scored DNF holes for player ${player.user_id} in game ${gameId}`);
      }
    }

    // Mark game as completed
    db.prepare("UPDATE games SET status = 'completed' WHERE id = ?").run(gameId);
    finalized.push(gameId);
    console.log(`[Finalize] Game ${gameId} (${game.name}) marked as completed`);
  }

  res.json({ finalized, count: finalized.length });
});

// ---------- Helpers ----------

function formatUser(row: Record<string, string>) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    nickname: row.nickname || undefined,
    avatar: {
      category: row.avatar_category,
      variant: row.avatar_variant,
    },
    theme: row.theme,
    createdAt: row.created_at,
  };
}

function formatGame(row: Record<string, unknown>) {
  const gameId = row.id as string;

  // Get players
  const players = db.prepare('SELECT user_id FROM game_players WHERE game_id = ?')
    .all(gameId) as { user_id: string }[];

  // Get invitations
  const invites = db.prepare('SELECT user_id FROM game_invitations WHERE game_id = ?')
    .all(gameId) as { user_id: string }[];

  // Get rounds
  const rounds = db.prepare('SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number')
    .all(gameId) as Record<string, unknown>[];

  return {
    id: gameId,
    name: row.name,
    creatorId: row.creator_id,
    visibility: row.visibility,
    password: row.password || undefined,
    invitedUserIds: invites.map(i => i.user_id),
    playerIds: players.map(p => p.user_id),
    rounds: rounds.map(formatRound),
    currentRound: row.current_round,
    status: row.status || 'active',
    createdAt: row.created_at,
  };
}

function formatRound(row: Record<string, unknown>) {
  const roundNumber = row.round_number as number;
  const holes = row.holes_json ? JSON.parse(row.holes_json as string) : [];

  return {
    roundNumber,
    holes,
    wordMode: row.word_mode || 'custom',
    frontNineTheme: row.front_nine_theme || undefined,
    backNineTheme: row.back_nine_theme || undefined,
    startDate: row.start_date,
    startWordModeFront: row.start_word_mode_front || undefined,
    startWordModeBack: row.start_word_mode_back || undefined,
    startWordThemeFront: row.start_word_theme_front || undefined,
    startWordThemeBack: row.start_word_theme_back || undefined,
    winnerPicks: row.winner_picks ? true : undefined,
  };
}

function formatRoundResult(row: Record<string, unknown>) {
  return {
    gameId: row.game_id,
    roundNumber: row.round_number,
    userId: row.user_id,
    holes: JSON.parse(row.holes_json as string),
    totalScore: row.total_score,
    completedAt: row.completed_at || undefined,
  };
}

function formatWordleStats(row: Record<string, unknown>) {
  return {
    gamesPlayed: row.games_played,
    gamesWon: row.games_won,
    currentStreak: row.current_streak,
    maxStreak: row.max_streak,
    guessDistribution: JSON.parse(row.guess_distribution_json as string),
    importedAt: row.imported_at,
    source: row.source,
  };
}

// ---------- SPA fallback ----------
// All non-API routes serve the React app
app.get('*path', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------- Start server ----------

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
