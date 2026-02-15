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

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and production builds
- **Bootstrap 5** + React Bootstrap for responsive UI
- **React Router** for client-side routing
- **localStorage** for data persistence (no backend required)
- **Pexels API** for golf course imagery (optional)

## Project Structure

```
wordle-links/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images and static resources
│   ├── components/
│   │   ├── common/           # Avatar, AvatarPicker
│   │   ├── game/             # WordleBoard, Keyboard, GolfScorecard, HoleNavigator
│   │   └── layout/           # Navbar, Footer, Layout
│   ├── context/              # AuthContext, GameContext (React Context providers)
│   ├── data/                 # Word lists, avatar definitions
│   ├── pages/                # All route pages
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CreateGamePage.tsx
│   │   ├── GamePlayPage.tsx
│   │   ├── GameResultsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── LeaderboardPage.tsx
│   ├── styles/               # Custom CSS (theme.css)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Game logic, storage helpers, Pexels API
│   ├── App.tsx               # Root component with routing
│   └── main.tsx              # Entry point
├── .env.example              # Environment variable template
├── index.html                # HTML entry point
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
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

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Available Scripts

| Command           | Description                              |
|:-------------------|:-----------------------------------------|
| `npm run dev`      | Start development server with HMR        |
| `npm run build`    | Type-check and build for production       |
| `npm run preview`  | Preview production build locally          |
| `npm run lint`     | Run ESLint                               |

### Building for Production

```bash
npm run build
```

This outputs optimized static files to the `dist/` directory.

## AWS EC2 Deployment

This guide covers deploying Wordle Links to an AWS EC2 instance with Nginx as a reverse proxy and HTTPS via Let's Encrypt.

### 1. Launch an EC2 Instance

1. Go to the [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Configure:
   - **Name:** `wordle-links`
   - **AMI:** Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance type:** `t2.micro` (free tier eligible) or `t3.small`
   - **Key pair:** Create or select an existing key pair
   - **Security Group:** Allow inbound traffic on ports:
     - **22** (SSH)
     - **80** (HTTP)
     - **443** (HTTPS)
4. Launch the instance and note the public IP address

### 2. Connect to Your Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
# or for Ubuntu:
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3. Install Dependencies

**Amazon Linux 2023:**

```bash
# Update system
sudo dnf update -y

# Install Node.js 20.x
sudo dnf install -y nodejs20 npm

# Install Nginx
sudo dnf install -y nginx

# Install Git
sudo dnf install -y git
```

**Ubuntu 22.04:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### 4. Clone and Build the Application

```bash
# Clone the repository
cd /home/ec2-user   # or /home/ubuntu on Ubuntu
git clone https://github.com/your-username/wordle-links.git
cd wordle-links

# Install dependencies
npm install

# (Optional) Set up Pexels API key
cp .env.example .env
nano .env
# Add your VITE_PEXELS_API_KEY

# Build for production
npm run build
```

### 5. Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/conf.d/wordle-links.conf
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    root /home/ec2-user/wordle-links/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Test and restart Nginx:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

If using Ubuntu, remove the default site:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

### 6. Set File Permissions

```bash
# Ensure Nginx can read the dist directory
sudo chmod -R 755 /home/ec2-user/wordle-links/dist
sudo chown -R ec2-user:ec2-user /home/ec2-user/wordle-links
```

### 7. Set Up HTTPS with Let's Encrypt (Optional but Recommended)

If you have a domain name pointed to your EC2 instance:

**Amazon Linux 2023:**

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Ubuntu 22.04:**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically update your Nginx configuration for HTTPS and set up auto-renewal.

To test auto-renewal:

```bash
sudo certbot renew --dry-run
```

### 8. Set Up Auto-Deploy (Optional)

Create a deployment script:

```bash
nano /home/ec2-user/deploy.sh
```

```bash
#!/bin/bash
set -e

cd /home/ec2-user/wordle-links
git pull origin master
npm install
npm run build

echo "Deployment complete!"
```

```bash
chmod +x /home/ec2-user/deploy.sh
```

Run it whenever you push updates:

```bash
./deploy.sh
```

### 9. Verify Deployment

1. Open your browser and navigate to `http://your-ec2-public-ip` (or your domain)
2. You should see the Wordle Links home page
3. Test the full flow: sign up, create a game, play a few holes

### Troubleshooting

| Issue | Solution |
|:------|:---------|
| 502 Bad Gateway | Check Nginx config with `sudo nginx -t` and logs at `/var/log/nginx/error.log` |
| Permission denied | Run `sudo chmod -R 755 /home/ec2-user/wordle-links/dist` |
| Page not found on refresh | Ensure the `try_files` directive is in your Nginx config |
| Port 80 blocked | Check EC2 Security Group allows inbound HTTP (port 80) |
| Build fails | Check Node.js version with `node -v` (needs >= 18) |

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
