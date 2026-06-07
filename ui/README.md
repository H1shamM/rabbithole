# 🎲 StumbleClone

**A modern, production‑ready reimagining of the classic serendipitous discovery engine.**  
Click “Stumble” and explore hidden gems from Wikipedia, Reddit, Hacker News, YouTube, NASA, and more. Rate what you like, save favorites, and get personalised recommendations.

[![CI](https://github.com/H1shamM/stumble-clone/actions/workflows/ci.yml/badge.svg)](https://github.com/H1shamM/stumble-clone/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Smart Discovery** – Weighted random algorithm that learns from your likes/dislikes  
- **PWA** – Install on your phone; works offline, feels native  
- **Social Login** – Google & GitHub OAuth2, plus email/password  
- **Community Submissions** – Users can submit new URLs for moderation  
- **Favorites & History** – Persist liked content and review your journey  
- **Recommendations** – “Because you liked X” suggestions based on ratings  
- **Dark Mode** – Automatic or manual, saved in localStorage  
- **Full‑text Search** – Find any asset by title or URL  
- **Browser Extension** – Side panel for stumbling directly from your browser  
- **Tested & CI** – 80%+ coverage, GitHub Actions runs lint + tests

---

## 🧱 Tech Stack

| Area | Technologies |
|------|--------------|
| **Backend** | Node.js 20+, Express 5, TypeScript, SQLite (better-sqlite3), Passport.js (OAuth2), bcrypt, JWT, Vitest, ESLint |
| **Frontend** | React 19, Vite 6, TypeScript, PWA (vite-plugin-pwa), CSS custom properties, Vitest, React Testing Library |
| **Extension** | Manifest V3 (side panel, background script) |
| **DevOps** | Docker, docker-compose, GitHub Actions, Playwright (E2E) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm

### 1. Clone the repository

```
git clone https://github.com/H1shamM/stumble-clone.git
cd stumble-clone
```

### 2. Backend

```
cd app
npm install
npm start
```

The API runs on `http://localhost:3000`.  
On first start it seeds a local `stumble.db` with default assets.

### 3. Frontend (UI)

```
cd ui
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. (Optional) Browser Extension

```
./scripts/build-extension.sh
```

Then load the `extension/` folder as an unpacked extension in Chrome/Edge (`chrome://extensions` → Developer mode).

### 5. Run with Docker (everything)

```
docker-compose up
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---

## 📁 Project Structure

```
stumble-clone/
├── app/                    # Backend API (Node + Express)
│   ├── api/v1/             # Routes (auth, discovery, submissions, health)
│   ├── config/             # Passport & app settings
│   ├── db/                 # Storage port + SQLite adapter
│   ├── models/             # Asset, User, Submission
│   ├── services/           # DiscoveryService (core logic)
│   ├── sources/            # Content fetchers (Reddit, HN, Wikipedia, etc.)
│   ├── middleware/         # JWT authentication
│   ├── main.ts             # Entry point
│   └── package.json
├── ui/                     # React frontend (Vite + PWA)
│   ├── src/
│   │   ├── components/     # App, SubmissionForm
│   │   ├── hooks/          # usePWA
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   └── package.json
├── extension/              # Browser extension
│   ├── background.js
│   └── manifest.json
├── tests/                  # Unit & integration tests
├── scripts/                # Build helpers
├── docs/                   # Documentation (coding standards, workflow, etc.)
├── docker-compose.yml
└── README.md
```

---

## 🔧 Environment Variables

Create a `.env` file in `/app` (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 3000) |
| `DB_PATH` | SQLite database path (default `stumble.db`) |
| `JWT_SECRET` | Secret for signing JWTs (change in production) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | For GitHub OAuth |
| `FRONTEND_URL` | Frontend origin for OAuth redirects (default `http://localhost:5173`) |

---

## 🧪 Testing

```bash
# Backend tests
cd app
npm test

# Frontend tests
cd ui
npm test

# E2E screenshots (requires both servers running)
node capture_screenshots.js
```

---

## 🤝 Contributing

1. Read `docs/CODING_STANDARDS.md` and `docs/WORKFLOW.md`
2. Create an issue using the templates in `docs/TEMPLATES.md`
3. Branch off `main`: `feature/your-feature` or `fix/your-fix`
4. Write tests, run lint, ensure coverage ≥80%
5. Open a pull request with `Closes #issue` in the body

---

## 📄 License

MIT © [H1shamM](https://github.com/H1shamM)