# StumbleClone: A Serendipitous Discovery Engine

StumbleClone is a professional-grade recreation of the classic StumbleUpon experience. Built as a **Modular Monolith** using **Hexagonal Architecture**, it provides a cross-platform discovery loop for the open web.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 20+**
- **Docker & Docker Compose** (optional)

### 2. Backend Setup
```bash
cd app
npm install
npm start
```
*The backend will automatically seed initial "hidden gem" URLs into a local SQLite database (`stumble.db`) on first run.*

### 3. Frontend / Web Discovery
```bash
cd ui
npm install
npm run dev
```
Visit `http://localhost:5173` to start stumbling from your browser.

### 4. Browser Extension Setup
1. Run the build script:
   ```bash
   ./scripts/build-extension.sh
   ```
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer Mode**.
4. Click **Load Unpacked** and select the `stumble-clone/extension` folder.
5. Click the StumbleClone icon in your toolbar to open the **Side Panel**.

---

## 🏗️ Architecture

Following the engineering standards of the `adapter-system`, this project uses a strict **Hexagonal (Ports & Adapters)** design:

- **`app/api/`**: Versioned Express routes (`v1`).
- **`app/services/`**: Core business logic and orchestration.
- **`app/models/`**: Zod-backed domain models for runtime validation.
- **`app/db/`**: Persistence adapters (SQLite).
- **`ui/`**: Responsive React + TypeScript frontend.

## 🛠️ Development & Skills

This repository is optimized for AI-assisted engineering:

- **Linting:** `npm run lint` (ESLint + Prettier)
- **Testing:** `npm test` (Vitest with 80% coverage goals)
- **Type Checking:** `npm run typecheck`

Refer to **`CLAUDE.md`** for detailed engineering skills and architectural guidelines.

## 📱 Mobile Support
StumbleClone is designed as a **Responsive Web App**. You can open the Web UI on any smartphone browser and "Add to Home Screen" to use it as a PWA (Progressive Web App).

---
*Created by [H1shamM](https://github.com/H1shamM) using Professional Engineering Workflows.*
