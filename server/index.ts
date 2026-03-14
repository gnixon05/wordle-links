import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Initialize database tables
initializeDatabase();
console.log('[Server] Database initialized');

// ---------- Helper: session auth middleware ----------

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
  (req as express.Request & { userId: string }).userId = userId;
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

  // Create session
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

  // Create session
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

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all() as Record<string, string>[];
  res.json(users.map(formatUser));
});

app.patch('/api/users/:id', requireAuth, (req, res) => {
  const authedReq = req as express.Request & { userId: string };
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

// ---------- Start server ----------

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
