#!/bin/bash
# Persistent start script — runs both backend and frontend dev servers.
# Both servers share the same bash session so they don't get killed.

set -e
PIDS=()

# Resolve project root (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

cleanup() {
  echo "Cleaning up servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

# Kill any stale processes
pkill -f "tsx src/index" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start backend
cd "$PROJECT_ROOT/server"
echo "[$(date +%T)] Starting backend on port 3001..."
PORT=3001 npx tsx src/index.ts > /tmp/zero-server.log 2>&1 &
PIDS+=("$!")

# Wait for backend
for i in {1..15}; do
  if curl -sf http://127.0.0.1:3001/api/health > /dev/null 2>&1; then
    echo "[$(date +%T)] ✓ Backend ready"
    break
  fi
  sleep 0.5
done

# Start frontend dev server
cd "$PROJECT_ROOT"
echo "[$(date +%T)] Starting Vite dev server on port 5173..."
PORT=5173 npx vite --host 0.0.0.0 > /tmp/zero-vite.log 2>&1 &
PIDS+=("$!")

# Wait for vite
for i in {1..15}; do
  if curl -sf http://127.0.0.1:5173/ > /dev/null 2>&1; then
    echo "[$(date +%T)] ✓ Vite ready"
    break
  fi
  sleep 0.5
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Both servers are up!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001/api/health"
echo "════════════════════════════════════════════════════════"
echo ""

# Keep the script alive — wait for either server to exit
wait -n "${PIDS[@]}" 2>/dev/null || true
echo "[$(date +%T)] A server exited, cleaning up..."
cleanup
