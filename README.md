# LiveDRIVE v5.7 — Watch Together, Anywhere, with Anyone

LiveDRIVE is the ultimate privacy-first, zero-authentication, real-time watch-together theater. It is designed to allow anyone to synchronized-watch videos from multiple sources (including direct video files, Google Drive links, HLS streams, YouTube, and Vimeo) without the friction of sign-ups, trackers, or subscription walls. 

---

## 🚀 Key Features

### 1. Zero-Friction Identity & Session Retention
- **Anonymous Identity**: No sign-ins, credentials, or accounts. On first visit, a fun anonymous handle (e.g. `GhostReel_447`) and an accent color are silently auto-generated and saved in `localStorage`.
- **Instant Load**: Nicknames render instantly in the navigation bar using inline script injections, eliminating page-load layout flickers.
- **Robust Session Persistence**: Refreshing the browser or clicking browser back/forward buttons will not interrupt active room play. The app automatically recovers your current theater room session, chat log history, and exact video position.

### 2. Premium Player Controls & Loop/Shuffle Toggles
- **Loop Toggle**: Cycles through **No Loop** (plays once and stops), **Loop One** (repeats the current video forever), and **Loop All** (loops through the entire queue).
- **Shuffle**: Play queue items in random order. The state is fully persisted and synced.
- **Prev / Next Navigation**: Skips between items in the queue with dimming disabled logic when the queue is empty.

### 3. Custom Draggable Queue (Playlist Panel)
- **Overlay Layout**: Slides in from the right on desktop, and slides up as a bottom sheet taking 65% screen height on mobile devices.
- **HTML5 Drag & Drop**: Drag rows to reorder items inside the queue instantly without any third-party frameworks. Reordering automatically corrects active indexing.
- **Bouncing CSS Equalizer**: The currently playing item displays an animated 3-bar equalizer instead of its list number.
- **Video Title Resolution**: Pasted YouTube URLs automatically fetch titles via a client-side `noembed.com` proxy wrapper to bypass CORS blocks. Vimeo and generic media files parse titles dynamically.
- **Badge Indicators**: Color-coded badges highlight the source type (`YT` red, `VIMEO` blue, `DRIVE` gold, `HLS` green, `MP4` purple) with duration indicators.

### 4. Interactive AWAKE Telemetry Watchdog
- **Built-in Dashboard**: Access `/hook.html` to monitor targets, logs, inbound heartbeats, and dispatched pulses.
- **Active Keep-Alives**: Starts background ping threads (`ping_loop` and `self_ping_loop`) on Flask launch, allowing the application to query and keep other Render, Replit, or custom containers awake via inbound and outbound HTTP heartbeats.

---

## 🛠️ Technology Stack & Architecture

- **Backend**: Python, Flask, Flask-SocketIO (for rooms management), `websockets` (for relay signaling).
- **Frontend**: Vanilla HTML5, CSS3 transitions, TailwindCSS (dashboard sections), dynamic JavaScript. No build step or package installation required on the client side.
- **Communication Channels**:
  - **Socket.IO Room Server**: Syncs video playback play/pause/seek events and chat rooms.
  - **WebSocket Signaling Relay**: A lightweight relay (`server.py`) for peer-to-peer sync commands.

---

## ⚙️ Quick Start

### 1. Install Dependencies
Make sure you have Python installed, then run:
```bash
pip install flask flask-socketio eventlet websockets requests
```

### 2. Run the Main Application Server
Start the Flask + Socket.IO server on port 8080 (or custom environment port):
```bash
python main.py
```

### 3. Run the Websocket Relay Server
Launch the signaling websocket relay on port 8765:
```bash
python server.py
```

---

## 💛 Support & Open Source Sponsorship

LiveDRIVE is completely **open source** and **free to use**. We do not harvest, track, or sell your data. Maintaining our active watchdog telemetry loops and hosting signaling servers incurs ongoing bandwidth costs. 

If LiveDRIVE makes your watch parties possible, consider supporting us:

### **Litecoin (LTC) Address**:
```text
ltc1q68v0ss6rjzt89rx4ll0e4c8fl657wej2lzngsg
```

### QR Scan Code:
![Litecoin QR Code](https://github.com/user-attachments/assets/8d83b1e1-ae37-4502-a5d9-9a34b909f7bc)
