# LiveDRIVE v6.0 — Watch Together, Anywhere, with Anyone

> **Zero Friction. Zero Accounts. 100% Real Time Frame Sync.**
> 
> UI Live on GitHub Pages: [https://pheonix14.github.io/LiveDRIVE/](https://pheonix14.github.io/LiveDRIVE/)

LiveDRIVE is a privacy-first, zero-registration watch-together theater. Synchronize video playback from YouTube, Vimeo, direct MP4/WebM files, HLS live streams (`.m3u8`), and Google Drive with sub-second synchronization and real-time live chat.

---

## 🏗️ Architecture

LiveDRIVE uses a decoupled architecture designed for zero hosting costs and maximum deployment flexibility:

```
┌────────────────────────────────────────────────────────┐
│               GitHub Pages (Static UI)                 │
│         Next.js 14 · Tailwind CSS · TypeScript         │
│          https://pheonix14.github.io/LiveDRIVE/         │
└───────────────────────────┬────────────────────────────┘
                            │
               WebSocket Signaling & Chat
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Render.com  │     │Android Termux│     │   Local PC   │
│ Cloud Relay  │     │ Mobile Relay │     │Windows/Linux │
│ (Automatic   │     │ (Local WiFi  │     │ (Single-Cmd  │
│     SSL)     │     │  or Tunnel)  │     │  setup.bat)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 🚀 Quick Launch Guide

### Option A: Use the GitHub Pages UI (Zero Install)
1. Open the UI: [https://pheonix14.github.io/LiveDRIVE/](https://pheonix14.github.io/LiveDRIVE/)
2. Click **Relay** in the top navigation bar to select your backend:
   - **Render Cloud**: Connects to cloud relay with free automatic SSL.
   - **Termux (Android)**: Connects to your phone relay.
   - **Local PC**: Connects to `ws://localhost:8765`.
   - **Public Mesh**: Connects to the free public mesh relay (zero setup).
3. Create or join a room code and start watching together!

---

### Option B: Run Backend on Render.com (Free Cloud)
1. Fork or clone this repository to GitHub.
2. Go to [Render.com](https://render.com) $\to$ **New Web Service** $\to$ Connect this repository.
3. Render automatically detects [`render.yaml`](render.yaml) and [`Dockerfile`](Dockerfile).
4. Once deployed, copy your Render URL (e.g. `https://your-app.onrender.com`) and paste it into the LiveDRIVE UI **Relay** settings.

---

### Option C: Run Backend on Android (Termux)
You can run the full signaling and room relay directly on your Android phone:
1. Open **Termux** on Android and clone the repository:
   ```bash
   pkg update && pkg install git
   git clone https://github.com/pheonix14/LiveDRIVE.git
   cd LiveDRIVE
   ```
2. Launch the launcher:
   ```bash
   chmod +x termux-start.sh
   ./termux-start.sh
   ```
3. The script prints your phone's WiFi IP (e.g. `192.168.1.50:8765`).
4. In the GitHub Pages UI, click **Relay**, select **Termux**, and enter your phone's IP!

---

### Option D: Run on PC (Windows / Linux / macOS)

#### Windows
Run the automated installer:
```cmd
setup.bat
```
After setup, run convenience commands directly from any terminal:
- `livedrive` or `ld` — Launch full stack or interactive menu
- `ldui` — Launch Next.js UI dev server on `http://localhost:3000`
- `ldcli` — Launch Python backend servers on ports `8765` and `8080`

#### Linux / macOS
Run the automated setup script:
```bash
chmod +x setup.sh && ./setup.sh
```
Terminal commands `livedrive`, `ld`, `ldui`, and `ldcli` will be linked to `~/.local/bin/`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 14, React 18, Tailwind CSS, Lucide Icons |
| **Video decoders** | YouTube IFrame API, Vimeo Player API, Native HTML5 Video, HLS.js |
| **Signaling Relay** | Python `websockets` (port 8765), `BroadcastChannel` (cross-tab P2P) |
| **Room Server** | Python Flask, Flask-SocketIO (port 8080), Eventlet |
| **Deployment** | GitHub Pages (UI), Render / Termux / Docker (Backend) |

---

## 📦 GitHub Releases & Artifacts

Every release includes standalone zip packages:
1. `livedrive-backend.zip`: Portable Python backend for PC, Termux, and Render.
2. `livedrive-static-ui.zip`: Pre-built static export ready to host on GitHub Pages or any static CDN.

---

## 💛 Support & Sponsorship

LiveDRIVE is free, private, and open source. If LiveDRIVE makes your watch parties possible, consider supporting ongoing bandwidth and relay costs:

**Litecoin (LTC)**: `ltc1q68v0ss6rjzt89rx4ll0e4c8fl657wej2lzngsg`
