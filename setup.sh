#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$SCRIPT_DIR/bin"

echo "======================================================"
echo "   LiveDRIVE Setup & Terminal CLI Installer (Linux/macOS)"
echo "======================================================"

# 1. Check Python
if ! command -v python3 &>/dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    exit 1
fi
echo "[OK] Python: $(python3 --version)"

# 2. Check Node
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
    echo "[ERROR] Node.js or npm is not installed!"
    exit 1
fi
echo "[OK] Node: $(node -v) / npm: $(npm -v)"

# 3. Python dependencies
echo "[3/4] Installing Python requirements..."
python3 -m pip install -r "$SCRIPT_DIR/requirements.txt" 2>/dev/null || \
python3 -m pip install --break-system-packages -r "$SCRIPT_DIR/requirements.txt" 2>/dev/null || \
uv pip install --system -r "$SCRIPT_DIR/requirements.txt" 2>/dev/null || true
echo "[OK] Python dependencies ready."

# 4. Frontend dependencies
echo "[4/4] Installing Next.js dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install
cd "$SCRIPT_DIR"

# 5. Make executable scripts in bin/
mkdir -p "$BIN_DIR"
chmod +x "$SCRIPT_DIR/livedrive_cli.py"

cat <<'EOF' > "$BIN_DIR/livedrive"
#!/usr/bin/env bash
REAL_BIN="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$(dirname "$REAL_BIN")")"
python3 "$SCRIPT_DIR/livedrive_cli.py" "$@"
EOF

cat <<'EOF' > "$BIN_DIR/ld"
#!/usr/bin/env bash
REAL_BIN="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$(dirname "$REAL_BIN")")"
python3 "$SCRIPT_DIR/livedrive_cli.py" "$@"
EOF

cat <<'EOF' > "$BIN_DIR/ldui"
#!/usr/bin/env bash
REAL_BIN="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$(dirname "$REAL_BIN")")"
python3 "$SCRIPT_DIR/livedrive_cli.py" --ui "$@"
EOF

cat <<'EOF' > "$BIN_DIR/ldcli"
#!/usr/bin/env bash
REAL_BIN="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$(dirname "$REAL_BIN")")"
python3 "$SCRIPT_DIR/livedrive_cli.py" --cli "$@"
EOF

chmod +x "$BIN_DIR/livedrive" "$BIN_DIR/ld" "$BIN_DIR/ldui" "$BIN_DIR/ldcli"

# Also symlink to ~/.local/bin if available
if [ -d "$HOME/.local/bin" ]; then
    ln -sf "$BIN_DIR/livedrive" "$HOME/.local/bin/livedrive"
    ln -sf "$BIN_DIR/ld" "$HOME/.local/bin/ld"
    ln -sf "$BIN_DIR/ldui" "$HOME/.local/bin/ldui"
    ln -sf "$BIN_DIR/ldcli" "$HOME/.local/bin/ldcli"
    echo "[SUCCESS] CLI shortcuts linked to ~/.local/bin/ (livedrive, ld, ldui, ldcli)!"
fi

echo "======================================================"
echo "                 SETUP COMPLETE!"
echo "======================================================"
echo "Available terminal commands:"
echo "  - livedrive : Interactive cinema menu or start all services"
echo "  - ld        : Alias for livedrive"
echo "  - ldui      : Launch Next.js UI"
echo "  - ldcli     : Launch Backend WebSocket & Flask servers"
