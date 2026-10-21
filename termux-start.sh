#!/usr/bin/env bash
# LiveDRIVE — Termux (Android) One-Command Backend Launcher
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================"
echo "    __    _            ____  ____  _____ _    __ _____ "
echo "   / /   (_)   _____  / __ \/ __ \/  _/ | / /____ / "
echo "  / /   / / | / / _ \/ / / / /_/ // / | | / / __/ /  "
echo " / /___/ /| |/ /  __/ /_/ / _, _// /  | |/ / /___/   "
echo "/_____/_/ |___/\___/_____/_/ |_/___/  |___/_____/    "
echo "======================================================"
echo "         ANDROID TERMUX RELAY SERVER LAUNCHER         "
echo "======================================================"
echo ""

# 1. Check & Install Python in Termux
if ! command -v python &>/dev/null && ! command -v python3 &>/dev/null; then
    echo "[1/3] Python not found. Installing via Termux pkg..."
    pkg update -y
    pkg install -y python
fi

PY_CMD="python3"
if ! command -v python3 &>/dev/null; then
    PY_CMD="python"
fi
echo "[OK] Python is available: $($PY_CMD --version)"

# 2. Check/Install Python Dependencies
echo "[2/3] Checking backend dependencies..."
$PY_CMD -m pip install -r "$SCRIPT_DIR/requirements.txt" 2>/dev/null || \
$PY_CMD -m pip install --break-system-packages -r "$SCRIPT_DIR/requirements.txt" 2>/dev/null || \
$PY_CMD -m pip install flask flask-socketio websockets requests eventlet 2>/dev/null || true
echo "[OK] Backend dependencies ready."

# 3. Detect Phone IP address
LOCAL_IP=""
if command -v ip &>/dev/null; then
    LOCAL_IP=$(ip -4 addr show wlan0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1 || true)
fi
if [ -z "$LOCAL_IP" ] && command -v ifconfig &>/dev/null; then
    LOCAL_IP=$(ifconfig wlan0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1 || true)
fi
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$($PY_CMD -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null || echo "127.0.0.1")
fi

echo "======================================================"
echo "              TERMUX RELAY SERVER READY               "
echo "======================================================"
echo "Your Phone Local IP: $LOCAL_IP"
echo ""
echo "-> WebSocket Relay URL:  ws://$LOCAL_IP:8765"
echo "-> Flask HTTP Server:    http://$LOCAL_IP:8080"
echo ""
echo "📱 HOW TO CONNECT FROM GITHUB PAGES UI:"
echo " 1. Open LiveDRIVE on GitHub Pages on any device/phone."
echo " 2. Click the 'Relay' button in the top navbar."
echo " 3. Select 'Termux (Android Phone)'."
echo " 4. Enter your phone address:  $LOCAL_IP:8765"
echo " 5. Click 'Save & Connect' — instant frame synchronization!"
echo ""
echo "🌐 FOR INTERNET SYNC WITHOUT LOCAL WIFI:"
echo " Run: pkg install cloudflared && cloudflared tunnel --url http://localhost:8080"
echo "======================================================"
echo "Starting servers... (Press Ctrl+C to stop)"
echo ""

cd "$SCRIPT_DIR"
$PY_CMD livedrive_cli.py --cli
