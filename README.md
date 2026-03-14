# Wordle Links

A golf-themed Wordle game where every guess counts as a stroke. Play 18 holes of word puzzles, compete with friends, and climb the leaderboard.

## Overview

Wordle Links combines the word-guessing mechanics of [Wordle](https://www.nytimes.com/games/wordle/index.html) with golf scoring. Each round consists of 18 holes, and each hole presents a word puzzle. Your number of guesses equals your strokes — solve it under par for a birdie or eagle, or take too many for a bogey.

### Key Features

- **18-Hole Rounds** — Front 9 and Back 9, just like real golf
- **Variable Pars** — Par 3 (4-letter words, 5 guesses), Par 4 (5-letter words, 6 guesses), Par 5 (6-letter words, 7 guesses)
- **Themed Words** — Choose from Golf, Sports, Nature, Food, Animals, or Random themes
- **Custom Words** — Specify your own words for any or all holes
- **Multiplayer** — Create public or private games, invite friends, set game passwords
- **Hidden Results** — Scores stay hidden until all players finish, then reveal full scorecards
- **Golf Scorecards** — Full front 9 / back 9 scorecards with par, birdies, eagles, and bogeys
- **Leaderboards** — Per-game and global leaderboard rankings
- **Player Profiles** — Career stats, score distribution, game history
- **Fun Avatars** — Golf balls in costumes or penguins in golf shenanigans
- **Pexels Integration** — Beautiful golf course imagery via the Pexels API
- **Mobile First** — Fully responsive design built with Bootstrap 5

## Scoring

| Guesses (Par 4) | Score | Golf Term      |
|:----------------:|:-----:|:--------------:|
| 1                | -3    | Hole in One    |
| 2                | -2    | Eagle          |
| 3                | -1    | Birdie         |
| 4                | E     | Par            |
| 5                | +1    | Bogey          |
| 6                | +2    | Double Bogey   |
| DNF              | +3    | Triple Bogey   |

Scoring adjusts based on par: a Par 3 hole has 5 max guesses, Par 5 has 7 max guesses.

## Architecture

Wordle Links has two components:

1. **Frontend** — React 19 SPA served by Vite (dev) or any static file server (production)
2. **Backend** — Express.js API server with SQLite database for persistent storage

### Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and production builds
- **Bootstrap 5** + React Bootstrap for responsive UI
- **React Router** for client-side routing
- **Express.js** API server (Node.js)
- **SQLite** via better-sqlite3 for persistent data storage
- **bcrypt** for secure password hashing
- **Pexels API** for golf course imagery (optional)

### Data Storage

All data is stored in a SQLite database (`wordle-links.db`):

| Table | Purpose |
|:------|:--------|
| `users` | User accounts with bcrypt-hashed passwords |
| `sessions` | Bearer token sessions (365-day expiry) |
| `games` | Game metadata (name, visibility, creator) |
| `game_players` | Game-to-player membership |
| `game_invitations` | Pending game invitations |
| `rounds` | Round configs with hole pars and themes |
| `round_results` | Player scores per round (holes stored as JSON) |
| `game_words` | Target words per round (hidden from players) |
| `game_start_words` | Forced first guesses per round |
| `wordle_imported_stats` | Imported NYT Wordle statistics per user |

## Project Structure

```
wordle-links/
├── server/                    # Backend API server
│   ├── db.ts                  # SQLite database schema and initialization
│   └── index.ts               # Express server with all API endpoints
├── src/
│   ├── components/
│   │   ├── common/            # Avatar, AvatarPicker
│   │   ├── game/              # WordleBoard, Keyboard, GolfScorecard, HoleNavigator
│   │   └── layout/            # Navbar, Footer, Layout
│   ├── context/               # AuthContext, GameContext, ThemeContext
│   ├── data/                  # Word lists, avatar definitions
│   ├── pages/                 # All route pages
│   ├── styles/                # Custom CSS (theme.css)
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Game logic, API client, Pexels API
│   ├── App.tsx                # Root component with routing
│   └── main.tsx               # Entry point
├── .env.example               # Environment variable template
├── index.html                 # HTML entry point
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts             # Vite config with dev proxy rules
```

## Local Development

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/wordle-links.git
   cd wordle-links
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables (optional):**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Pexels API key if you want live golf course images:

   ```
   VITE_PEXELS_API_KEY=your_pexels_api_key_here
   ```

   Get a free API key at [pexels.com/api](https://www.pexels.com/api/). The app works without it using fallback images.

4. **Start both the API server and frontend:**

   ```bash
   npm run dev:all
   ```

   Or run them separately in two terminals:

   ```bash
   # Terminal 1 — API server (port 3001)
   npm run dev:server

   # Terminal 2 — Vite frontend (port 5173)
   npm run dev
   ```

   The Vite dev server proxies `/api/*` requests to the Express backend automatically.

   The app will be available at `http://localhost:5173`.

### Available Scripts

| Command             | Description                                        |
|:---------------------|:---------------------------------------------------|
| `npm run dev`        | Start Vite frontend dev server with HMR            |
| `npm run dev:server` | Start Express API server with auto-reload (tsx)     |
| `npm run dev:all`    | Start both API server and frontend concurrently     |
| `npm run build`      | Type-check and build frontend for production        |
| `npm run preview`    | Preview production build locally                    |
| `npm run lint`       | Run ESLint                                         |

## Deployment

Wordle Links requires both a **static file server** (for the React frontend) and a **Node.js process** (for the Express API server). Below are two deployment options.

### Prerequisites (Both Options)

1. Build the frontend:

   ```bash
   npm install
   npm run build
   ```

2. (Optional) Set your Pexels API key in `.env` before building:

   ```bash
   cp .env.example .env
   # Edit .env and add VITE_PEXELS_API_KEY=your_key_here
   npm run build
   ```

---

### Option A: EC2 / VPS (Recommended)

Since the app requires a Node.js backend, a server-based deployment is the simplest approach.

#### 1. Launch a Server

- **AWS EC2:** `t2.micro` (free tier) with Amazon Linux 2023 or Ubuntu 22.04
- **Other VPS:** DigitalOcean, Linode, Render, Railway, etc.
- **Security group / firewall:** Allow ports **22** (SSH), **80** (HTTP), **443** (HTTPS)

#### 2. Install Dependencies

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y nodejs20 npm nginx git
```

#### 3. Clone and Build

```bash
cd ~
git clone https://github.com/your-username/wordle-links.git
cd wordle-links
npm install
npm run build
```

#### 4. Run the API Server with systemd

Create `/etc/systemd/system/wordle-links-api.service`:

```ini
[Unit]
Description=Wordle Links API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/wordle-links
ExecStart=/usr/bin/npx tsx server/index.ts
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable wordle-links-api
sudo systemctl start wordle-links-api

# Check status
sudo systemctl status wordle-links-api
```

#### 5. Configure Nginx

Create `/etc/nginx/conf.d/wordle-links.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /home/ubuntu/wordle-links/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Static frontend assets (long-lived cache for hashed files)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to the Express backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback — serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```bash
sudo rm -f /etc/nginx/sites-enabled/default  # Ubuntu only
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

#### 6. Add HTTPS with Let's Encrypt (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx   # Ubuntu
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run  # verify auto-renewal
```

#### Redeploying

```bash
cd ~/wordle-links
git pull origin master
npm install
npm run build
sudo systemctl restart wordle-links-api
```

---

### Option B: S3 + CloudFront (Frontend) + Separate API Host

If you want CDN-distributed frontend hosting, deploy the frontend to S3/CloudFront and the API server separately (e.g., on EC2, ECS, Lambda, or Railway).

#### Frontend (S3 + CloudFront)

1. **Create an S3 bucket** with static website hosting enabled
2. **Set index and error documents** both to `index.html`
3. **Upload the build:** `aws s3 sync dist/ s3://your-bucket --delete`
4. **Create a CloudFront distribution** pointing to the S3 website endpoint
5. **Add custom error responses** for 403 and 404 → `/index.html` with 200 status

#### API Server

Deploy the Express backend on any Node.js-capable platform:

- **EC2:** Follow steps 2-4 from Option A above
- **Railway / Render / Fly.io:** Push the repo and configure `npx tsx server/index.ts` as the start command
- **ECS / Fargate:** Containerize with a Dockerfile

Configure the frontend to point to your API URL by setting `VITE_API_URL` in `.env` before building, or configure CloudFront to proxy `/api/*` paths to your API server's origin.

---

### Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `VITE_PEXELS_API_KEY` | No | Pexels API key for golf course images (falls back to defaults) |
| `PORT` | No | API server port (default: `3001`) |

### Database

The SQLite database file (`wordle-links.db`) is created automatically on first server start in the project root. To back it up:

```bash
cp wordle-links.db wordle-links.db.backup
```

To reset the database, delete the file and restart the server — all tables will be recreated (empty).

---

### Troubleshooting

| Issue | Solution |
|:------|:---------|
| API returns "Network error" | Ensure the Express server is running (`npm run dev:server`) |
| SPA routes return 404 | Nginx: check `try_files` directive. S3: set error document to `index.html` |
| CloudFront serves stale content | Create an invalidation: `aws cloudfront create-invalidation --distribution-id ID --paths "/*"` |
| 502 Bad Gateway (Nginx) | Check `sudo systemctl status wordle-links-api` and `sudo nginx -t` |
| Database locked errors | Ensure only one server process is running. SQLite uses WAL mode for concurrent reads |
| Wordle word fetch fails | Check browser console for `[Wordle]` logs. The Vite proxy adds required headers for NYT API |
| Build fails | Verify Node.js >= 18 with `node -v` |

## Game Rules

### Creating a Game

1. Sign up or log in
2. From the Dashboard, click "Create Game"
3. Choose game name, visibility (public/private), and optionally set a password or invite players
4. Configure your round:
   - Set themes for Front 9 and Back 9 (or use the same theme)
   - Customize individual holes to Par 3, 4, or 5
   - Optionally specify custom words for each hole
5. Start playing!

### Playing a Round

- Each day the board opens (starting at your local midnight)
- Navigate between holes using the hole selector
- Type your guess and press Enter
- Green = correct letter in correct position
- Yellow = correct letter in wrong position
- Gray = letter not in the word
- Your number of guesses = your stroke count for that hole

### Viewing Results

- Your individual scorecard updates as you play
- Full game results (other players' boards and scorecards) stay hidden until every player in the game has completed the round
- Once all players finish, the leaderboard and detailed scorecards are revealed

### Unlimited Rounds

- Games can have unlimited rounds
- The game creator can start a new round once the current round is completed by all players

## License

[CC0 1.0 Universal](LICENSE) — Public Domain. No rights reserved.
