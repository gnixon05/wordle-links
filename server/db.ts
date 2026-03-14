import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'wordle-links.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      avatar_category TEXT NOT NULL DEFAULT 'golfball',
      avatar_variant TEXT NOT NULL DEFAULT 'white',
      theme TEXT NOT NULL DEFAULT 'light',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creator_id TEXT NOT NULL REFERENCES users(id),
      visibility TEXT NOT NULL DEFAULT 'public',
      password TEXT,
      current_round INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_players (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL DEFAULT 'player',
      PRIMARY KEY (game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS game_invitations (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      PRIMARY KEY (game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      holes_json TEXT NOT NULL DEFAULT '[]',
      word_mode TEXT NOT NULL DEFAULT 'custom',
      front_nine_theme TEXT,
      back_nine_theme TEXT,
      start_date TEXT NOT NULL,
      start_word_mode_front TEXT,
      start_word_mode_back TEXT,
      start_word_theme_front TEXT,
      start_word_theme_back TEXT,
      UNIQUE(game_id, round_number)
    );

    CREATE TABLE IF NOT EXISTS round_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      holes_json TEXT NOT NULL DEFAULT '[]',
      total_score INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      UNIQUE(game_id, round_number, user_id)
    );

    CREATE TABLE IF NOT EXISTS game_words (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      words_json TEXT NOT NULL DEFAULT '[]',
      PRIMARY KEY (game_id, round_number)
    );

    CREATE TABLE IF NOT EXISTS game_start_words (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      words_json TEXT NOT NULL DEFAULT '[]',
      PRIMARY KEY (game_id, round_number)
    );

    CREATE TABLE IF NOT EXISTS wordle_imported_stats (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      games_played INTEGER NOT NULL DEFAULT 0,
      games_won INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      max_streak INTEGER NOT NULL DEFAULT 0,
      guess_distribution_json TEXT NOT NULL DEFAULT '{}',
      imported_at TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT NOT NULL DEFAULT 'manual',
      PRIMARY KEY (user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);
    CREATE INDEX IF NOT EXISTS idx_round_results_user_id ON round_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_round_results_game_id ON round_results(game_id);
  `);
}

export default db;
