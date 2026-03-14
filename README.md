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

Wordle Links requires both a **static file server** (for the React frontend) and a **Node.js process** (for the Express API server). Below are three deployment options, starting with the simplest.

### Prerequisites (All Options)

- **Node.js** >= 18.x and **npm** >= 9.x
- A clone of this repository

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

The build output goes to `dist/` (frontend static files). The API server runs directly from `server/index.ts`.

---

### Option A: EC2 / VPS — Full Walkthrough from Scratch

This walks you through everything from getting a server to a live HTTPS deployment.

#### 1. Get a Server

Sign up with any cloud provider and create a virtual machine:

| Provider | Free Tier | Recommended Instance |
|:---------|:----------|:---------------------|
| **AWS EC2** | 12 months free | `t2.micro` / `t3.micro` with Ubuntu 22.04 or Amazon Linux 2023 |
| **DigitalOcean** | $200 trial credit | Basic Droplet, 1 vCPU / 1 GB RAM |
| **Linode (Akamai)** | $100 trial credit | Nanode 1 GB |
| **Vultr** | — | Cloud Compute, 1 vCPU / 1 GB RAM |
| **Hetzner** | — | CX22 (cheapest EU option) |

#### 2. Configure Firewall / Security Group

Open these ports in your provider's firewall or security group settings:

| Port | Protocol | Purpose |
|:-----|:---------|:--------|
| 22 | TCP | SSH access |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |

**AWS example:** In the EC2 console, edit your instance's security group inbound rules to allow TCP 22, 80, and 443 from `0.0.0.0/0`.

#### 3. Connect to Your Server

```bash
# Replace with your server's public IP and key file
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_SERVER_IP
```

If you're using a password-based login (DigitalOcean, Vultr), just `ssh root@YOUR_SERVER_IP`.

#### 4. Initial Server Setup

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Create a non-root user (skip if your provider already created one)
sudo adduser deploy
sudo usermod -aG sudo deploy

# Set up SSH key for the new user (copy from root)
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh

# Set up basic firewall (if not using provider firewall)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 5. Install Node.js, Nginx, and Git

```bash
# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y nodejs20 npm nginx git
```

Verify:

```bash
node -v   # Should print v20.x.x
npm -v    # Should print 9.x or higher
nginx -v  # Should print nginx/1.x.x
```

#### 6. Clone and Build

```bash
cd ~
git clone https://github.com/your-username/wordle-links.git
cd wordle-links
npm install

# (Optional) Configure Pexels API key
cp .env.example .env
nano .env   # Add VITE_PEXELS_API_KEY=your_key_here

npm run build
```

#### 7. Run the API Server with systemd

Create a systemd service so the API server starts on boot and auto-restarts on failure.

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

> **Note:** Replace `User=ubuntu` and `WorkingDirectory` paths with your actual username if different (e.g., `deploy`, `ec2-user`).

```bash
sudo systemctl daemon-reload
sudo systemctl enable wordle-links-api
sudo systemctl start wordle-links-api

# Verify it's running
sudo systemctl status wordle-links-api
curl http://localhost:3001/api/health   # Should return a response
```

#### 8. Configure Nginx as a Reverse Proxy

Nginx serves the static frontend files and proxies `/api/*` requests to the Express backend.

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

> **Note:** Replace `your-domain.com` with your actual domain. If you don't have a domain yet, use your server's public IP address.

```bash
sudo rm -f /etc/nginx/sites-enabled/default  # Ubuntu only — remove default site
sudo nginx -t                                 # Validate config
sudo systemctl enable nginx
sudo systemctl restart nginx
```

Visit `http://your-domain.com` (or `http://YOUR_SERVER_IP`) — you should see the app.

#### 9. Point Your Domain (Optional but Recommended)

In your domain registrar's DNS settings, add an **A record**:

| Type | Name | Value |
|:-----|:-----|:------|
| A | `@` | `YOUR_SERVER_IP` |
| A | `www` | `YOUR_SERVER_IP` |

DNS propagation takes a few minutes to a few hours.

#### 10. Add HTTPS with Let's Encrypt

Once your domain resolves to your server:

```bash
sudo apt install -y certbot python3-certbot-nginx   # Ubuntu
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run  # Verify auto-renewal works
```

Certbot automatically modifies your Nginx config to redirect HTTP to HTTPS and manage certificates. Certificates auto-renew via a systemd timer.

#### Redeploying Updates

```bash
cd ~/wordle-links
git pull origin master
npm install
npm run build
sudo systemctl restart wordle-links-api
# Nginx does not need a restart — it serves the new static files immediately
```

---

### Option B: Docker

Run the entire stack in Docker containers. This is useful for consistent environments and easier scaling.

#### 1. Create a `Dockerfile`

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3001
CMD ["npx", "tsx", "server/index.ts"]
```

#### 2. Create a `docker-compose.yml`

```yaml
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - db-data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./dist:/usr/share/nginx/html:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  db-data:
```

#### 3. Build and Run

```bash
docker compose up -d --build
```

#### 4. Redeploying

```bash
git pull origin master
docker compose up -d --build
```

---

### Option C: S3 + CloudFront (Frontend) + Separate API Host

If you want CDN-distributed frontend hosting, deploy the frontend to S3/CloudFront and the API server separately (e.g., on EC2, ECS, Lambda, or Railway).

#### Frontend (S3 + CloudFront)

1. **Create an S3 bucket** with static website hosting enabled
2. **Set index and error documents** both to `index.html`
3. **Upload the build:** `aws s3 sync dist/ s3://your-bucket --delete`
4. **Create a CloudFront distribution** pointing to the S3 website endpoint
5. **Add custom error responses** for 403 and 404 → `/index.html` with 200 status

#### API Server

Deploy the Express backend on any Node.js-capable platform:

- **EC2:** Follow steps 5-7 from Option A above
- **Railway / Render / Fly.io:** Push the repo and configure `npx tsx server/index.ts` as the start command
- **ECS / Fargate:** Use the Dockerfile from Option B

Configure the frontend to point to your API URL by setting `VITE_API_URL` in `.env` before building, or configure CloudFront to proxy `/api/*` paths to your API server's origin.

---

### Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `VITE_PEXELS_API_KEY` | No | Pexels API key for golf course images (falls back to defaults) |
| `VITE_API_URL` | No | API base URL for split frontend/backend deployments (default: same origin) |
| `PORT` | No | API server port (default: `3001`) |
| `NODE_ENV` | No | Set to `production` in deployed environments |

### Database

The SQLite database file (`wordle-links.db`) is created automatically on first server start in the project root. No database setup is needed.

**Backups:**

```bash
cp wordle-links.db wordle-links.db.backup
```

**Reset:** Delete the file and restart the server — all tables will be recreated (empty).

**Docker:** When using Docker, mount a volume for the database directory to persist data across container rebuilds (see the `docker-compose.yml` example above).

---

### Troubleshooting

| Issue | Solution |
|:------|:---------|
| API returns "Network error" | Ensure the Express server is running (`sudo systemctl status wordle-links-api` or `docker compose logs app`) |
| SPA routes return 404 | Nginx: check `try_files` directive. S3: set error document to `index.html` |
| CloudFront serves stale content | Create an invalidation: `aws cloudfront create-invalidation --distribution-id ID --paths "/*"` |
| 502 Bad Gateway (Nginx) | Check `sudo systemctl status wordle-links-api` and `sudo nginx -t` |
| Database locked errors | Ensure only one server process is running. SQLite uses WAL mode for concurrent reads |
| Wordle word fetch fails | Check browser console for `[Wordle]` logs. The Vite proxy adds required headers for NYT API |
| Build fails | Verify Node.js >= 18 with `node -v` |
| Docker container won't start | Check logs with `docker compose logs app` and ensure port 3001 is not already in use |
| HTTPS certificate errors | Run `sudo certbot renew` and check domain DNS points to the correct IP |
| Permission denied on server | Ensure the systemd service `User` matches the owner of the project directory |

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
