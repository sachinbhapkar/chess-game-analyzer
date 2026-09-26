#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=================================================="
echo " Starting Chess.com Game Analyzer"
echo " Backend: Spring Boot 3 (Port 8080)"
echo " Frontend: React + Vite (Port 5173)"
echo " Engine: Stockfish 19"
echo "=================================================="

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start backend
echo "Starting Spring Boot backend..."
java -jar "$DIR/backend/target/analyzer-0.0.1-SNAPSHOT.jar" &
BACKEND_PID=$!

# Wait for backend port 8080 to be ready
echo "Waiting for backend on http://localhost:8080..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/analysis/health > /dev/null; then
        echo "Backend is ready!"
        break
    fi
    sleep 1
done

# Start frontend
echo "Starting Vite frontend..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Chess.com Game Analyzer is running at http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

wait
