# Chess.com Game Analyzer

A full-stack chess game review and analysis platform. Connects to the **Chess.com Public API** to fetch any player's profile and match history, runs move-by-move evaluation using **Stockfish 19** via a **Java Spring Boot 3** backend, and presents an interactive game analysis workbench built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## Architecture Overview

```
chess-game-analyzer/
├── backend/                  # Java 21 & Spring Boot 3.3.4 Application
│   ├── src/main/java/com/chess/analyzer/
│   │   ├── config/           # CORS & engine configuration
│   │   ├── controller/       # REST API endpoints (Players, Analysis)
│   │   ├── model/            # DTOs (MoveEvaluation, GameAnalysisReport, etc.)
│   │   └── service/          # Stockfish UCI Service, Chess.com Client, Game Analyzer
│   ├── pom.xml               # Maven build with chesslib & Spring Web
│   └── target/analyzer-0.0.1-SNAPSHOT.jar
│
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Chessboard, EvalBar, MoveHistory, Charts, Search
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
├── start.sh                  # One-click startup script for both servers
└── README.md
```

---

## Key Features

1. **Chess.com Public API Integration**
   - Search any Chess.com player (e.g., `hikaru`, `magnuscarlsen`, `danielnaroditsky`).
   - Fetches avatar, title (GM/IM), followers, and live ratings across Rapid, Blitz, and Bullet.
   - Loads recent matches with opponent details, ratings, time controls, and opening names.

2. **Stockfish 19 Engine Analysis (Java UCI)**
   - Persistent sequential Stockfish worker processes for high-performance move evaluations.
   - Calculates centipawn evaluations, mate sequences, and engine-recommended best moves.
   - Categorizes every move using win-chance formulas:
     - ★ **Best Move** (loss < 1%)
     - ✓ **Excellent** (loss < 4%)
     - ○ **Good** (loss < 9%)
     - ?! **Inaccuracy** (loss < 18%)
     - ? **Mistake** (loss < 32%)
     - ?? **Blunder** (loss ≥ 32%)
     - 📖 **Book** (opening moves)
   - Computes **White & Black Accuracy %** and **Average Centipawn Loss (ACPL)**.

3. **Interactive Analysis Workbench**
   - **Interactive Chessboard** powered by `react-chessboard` with smooth piece movement.
   - **Stockfish Arrow Overlay** showing the engine's suggested best move on the board.
   - **Dynamic Evaluation Bar** reflecting current position advantage (+ / - / Mate in N).
   - **Playback Controls**: First (`|<<`), Previous (`<`), Auto-Play (`▶`), Next (`>`), Last (`>>|`), and Flip Board (`🔄`).
   - **Keyboard Shortcuts**: Left/Right arrows navigate moves, Up/Down jump to start/end, Space toggles auto-play.
   - **Advantage Momentum Chart**: SVG graph showing eval swings across the whole game with clickable data points.
   - **Custom PGN Import**: Paste any game PGN from Chess.com or Lichess to run deep engine review.

---

## Quick Start

### 1. Launch with `start.sh` (Recommended)
From the project root:
```bash
./start.sh
```
This boots:
- Spring Boot Backend on `http://localhost:8080`
- React Frontend on `http://localhost:5173`

---

### 2. Manual Startup

#### Backend
```bash
cd backend
mvn clean package
java -jar target/analyzer-0.0.1-SNAPSHOT.jar
```
Backend health endpoint: `http://localhost:8080/api/analysis/health`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
