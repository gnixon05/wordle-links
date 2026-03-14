# Wordle Tour

A golf-themed Wordle game where every guess counts as a stroke. Play 18 holes of word puzzles, compete with friends, and climb the leaderboard.

## Overview

Wordle Tour combines the word-guessing mechanics of [Wordle](https://www.nytimes.com/games/wordle/index.html) with golf scoring. Each round consists of 18 holes, and each hole presents a word puzzle. Your number of guesses equals your strokes — solve it under par for a birdie or eagle, or take too many for a bogey.

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
wordle-tour/
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
   git clone https://github.com/your-username/wordle-tour.git
   cd wordle-tour
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

## AWS Deployment

Wordle Tour is a static site — the production build outputs plain HTML, CSS, and JS to the `dist/` directory. This guide covers two AWS deployment options:

- **[Option A: S3 + CloudFront](#option-a-s3--cloudfront)** — Recommended. Serverless, scalable, low-cost, and zero maintenance.
- **[Option B: EC2 + Nginx](#option-b-ec2--nginx)** — Traditional server-based approach if you need more control.

### Prerequisites (Both Options)

1. Build the app locally:

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

### Option A: S3 + CloudFront

This is the recommended approach for static sites. No servers to manage, automatic scaling, and global CDN distribution.

#### 1. Create an S3 Bucket

1. Go to the [S3 Console](https://console.aws.amazon.com/s3/) and click **Create bucket**
2. **Bucket name:** `wordle-tour` (must be globally unique — adjust as needed)
3. **Region:** Choose the region closest to your users
4. Uncheck **Block all public access** (required for static website hosting)
5. Acknowledge the public access warning and create the bucket

#### 2. Enable Static Website Hosting

1. Open your bucket and go to **Properties**
2. Scroll to **Static website hosting** and click **Edit**
3. Enable it with:
   - **Index document:** `index.html`
   - **Error document:** `index.html` (required for SPA client-side routing)
4. Save and note the **bucket website endpoint** URL

#### 3. Set the Bucket Policy

Go to **Permissions > Bucket policy** and add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wordle-tour/*"
    }
  ]
}
```

Replace `wordle-tour` with your actual bucket name.

#### 4. Upload the Build

Using the [AWS CLI](https://aws.amazon.com/cli/):

```bash
# Upload all files
aws s3 sync dist/ s3://wordle-tour --delete

# Set cache headers for hashed assets (long-lived cache)
aws s3 cp s3://wordle-tour/assets/ s3://wordle-tour/assets/ \
  --recursive --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable"

# Set short cache for index.html (so deploys take effect quickly)
aws s3 cp s3://wordle-tour/index.html s3://wordle-tour/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=60"
```

At this point, the site is live at your S3 website endpoint.

#### 5. Add CloudFront (Recommended)

CloudFront adds HTTPS support, global CDN caching, and better performance.

1. Go to the [CloudFront Console](https://console.aws.amazon.com/cloudfront/) and click **Create distribution**
2. **Origin domain:** Select your S3 bucket's **website endpoint** (use the static website hosting URL, not the bucket itself)
3. **Viewer protocol policy:** Redirect HTTP to HTTPS
4. **Default root object:** `index.html`
5. Under **Error pages**, create a custom error response:
   - **HTTP error code:** `403`
   - **Response page path:** `/index.html`
   - **HTTP response code:** `200`
   - Repeat for error code `404`
6. (Optional) Under **Alternate domain names**, add your custom domain and select an ACM certificate
7. Create the distribution and wait for it to deploy (takes a few minutes)

Your site is now available at `https://your-distribution-id.cloudfront.net`.

#### 6. Set Up a Custom Domain (Optional)

1. Register or transfer your domain in [Route 53](https://console.aws.amazon.com/route53/) (or your DNS provider)
2. Request a free SSL certificate in [ACM](https://console.aws.amazon.com/acm/) (must be in `us-east-1` for CloudFront)
3. Add your domain as an alternate domain name in your CloudFront distribution
4. Create a Route 53 alias record pointing your domain to the CloudFront distribution

#### Redeploying (S3 + CloudFront)

```bash
npm run build
aws s3 sync dist/ s3://wordle-tour --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

### Option B: EC2 + Nginx

Use this approach if you prefer managing your own server or need server-side logic in the future.

#### 1. Launch an EC2 Instance

1. Go to the [EC2 Console](https://console.aws.amazon.com/ec2/) and click **Launch Instance**
2. Configure:
   - **Name:** `wordle-tour`
   - **AMI:** Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance type:** `t2.micro` (free tier eligible)
   - **Key pair:** Create or select an existing key pair
   - **Security group:** Allow inbound on ports **22** (SSH), **80** (HTTP), **443** (HTTPS)
3. Launch and note the public IP address

#### 2. Connect and Install Dependencies

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
# Ubuntu: ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

**Amazon Linux 2023:**

```bash
sudo dnf update -y
sudo dnf install -y nodejs20 npm nginx git
```

**Ubuntu 22.04:**

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
```

#### 3. Clone and Build

```bash
cd ~
git clone https://github.com/your-username/wordle-tour.git
cd wordle-tour
npm install
npm run build
```

#### 4. Configure Nginx

Create `/etc/nginx/conf.d/wordle-tour.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    root /home/ec2-user/wordle-tour/dist;  # adjust for Ubuntu: /home/ubuntu/...
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```bash
# Ubuntu only: remove the default site
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

#### 5. Set File Permissions

```bash
sudo chmod -R 755 ~/wordle-tour/dist
```

#### 6. Add HTTPS with Let's Encrypt (Optional)

Requires a domain name pointed to your EC2 instance.

```bash
# Amazon Linux 2023
sudo dnf install -y certbot python3-certbot-nginx

# Ubuntu 22.04
sudo apt install -y certbot python3-certbot-nginx

# Request certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

#### Redeploying (EC2)

```bash
cd ~/wordle-tour
git pull origin master
npm install
npm run build
```

---

### Troubleshooting

| Issue | Solution |
|:------|:---------|
| S3 403 Forbidden | Check the bucket policy allows `s3:GetObject` and public access is unblocked |
| SPA routes return 404 | S3: Set error document to `index.html`. CloudFront: Add custom error responses. Nginx: Check the `try_files` directive |
| CloudFront serves stale content | Create an invalidation: `aws cloudfront create-invalidation --distribution-id ID --paths "/*"` |
| 502 Bad Gateway (Nginx) | Run `sudo nginx -t` and check `/var/log/nginx/error.log` |
| Permission denied (Nginx) | Run `sudo chmod -R 755 ~/wordle-tour/dist` |
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
