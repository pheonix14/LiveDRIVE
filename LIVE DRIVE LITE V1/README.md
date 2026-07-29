# Couple Sync Video Player & Torrent Downloader APK 🎬❤️

A real-time dual video sync and fast torrent downloader mobile application built for couples. Written with native LibVLC (C/C++) media engine, LibTorrent C++ sequential downloader, Jetpack Compose UI, and WebSockets/WebRTC signaling sync.

---

## 🌟 Key Features

1. **VLC Playback Core (C/C++)**: Native LibVLC engine with hardware acceleration, container support (MKV, MP4, AVI, MOV), subtitle rendering, and dynamic video length verification.
2. **Synchronized Controls**: Real-time Play, Pause, Seek bar scrub, Forward +10 Seconds, Rewind -10 Seconds, and Playback Speed sync ($0.5\times - 2.0\times$).
3. **Super Fast Torrent Downloader & Streamer**: Integrated LibTorrent engine with sequential piece downloading. Includes a local HTTP proxy server (`http://127.0.0.1:8080`) that streams torrents to LibVLC immediately as they download.
4. **Dual Auto-Torrent Mirroring**: When Partner A inputs a magnet link or starts downloading a torrent, it automatically mirrors and initiates high-speed downloading on Partner B's phone instantly.
5. **2-User Couple Pairing**: Exclusive 2-user room limit via 6-Digit Invite Codes (`CP-XXXXXX`) or one-touch Invite Links.
6. **In-Player Overlay Chat & Hide Chat Button**: Collapsible floating chat window with explicit **"Hide Chat" / "Show Chat"** toggle button and unread message counter badge.
7. **Comprehensive Permissions Handling**: Built-in permissions request flow for Media/Videos, Storage/Files, Internet/Network Access, and Foreground Notifications.

---

## 📂 Project Architecture

```
LIVEDRIVE LITE/
├── android/                             # Android Kotlin App Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml      # Permissions (Media, Storage, Network, Foreground Service)
│   │   │   └── java/org/couple/syncplayer/
│   │   │       ├── MainActivity.kt      # Main Activity & Compose Navigation
│   │   │       ├── engine/
│   │   │       │   ├── VlcPlayerEngine.kt         # LibVLC native wrapper & transport controls
│   │   │       │   ├── TorrentStreamEngine.kt    # LibTorrent & local NanoHTTPD proxy streamer
│   │   │       │   └── SyncManager.kt            # Dual phone sync & timestamp drift alignment
│   │   │       ├── service/
│   │   │       │   └── PlaybackSyncService.kt    # Foreground service keeping sync active
│   │   │       └── ui/
│   │   │           ├── components/
│   │   │           │   ├── TransportControls.kt  # Play/Pause, Rewind 10s, Skip 10s, Seekbar
│   │   │           │   ├── ChatOverlay.kt        # Floating chat overlay + Hide Chat button
│   │   │           │   └── TorrentPanel.kt       # Fast magnet download & auto-mirror panel
│   │   │           └── screens/
│   │   │               ├── PermissionsScreen.kt  # Gallery/Video/Files permission request screen
│   │   │               ├── PairingScreen.kt      # 2-User invite code creation & couple join screen
│   │   │               └── PlayerScreen.kt       # Main LibVLC player view & dual mirror screen
│   ├── build.gradle.kts
│   └── settings.gradle.kts
└── server/                              # Node.js WebSocket Signaling & Relay Server
    ├── index.js                         # Room manager & WebSockets sync relay
    ├── package.json
    └── Dockerfile
```

---

## 🚀 How to Run & Build

### 1. Run Signaling Relay Server
```bash
cd server
npm install
npm start
```
*The signaling server will start on port `3000` (`ws://localhost:3000` or `ws://<YOUR_VPS_IP>:3000`).*

### 2. Build Android APK
Ensure you have Android Studio / Android SDK installed:
```bash
cd android
./gradlew assembleRelease
```
*The output APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.*

---

## 📱 How to Use Couple Sync Mode

1. Install the APK on both Partner A and Partner B's phones.
2. Open the app and tap **"Grant Required Permissions"** to allow Gallery, Video, and Network access.
3. Partner A taps **"Generate 6-Digit Invite Code"** (e.g. `CP-883921`) and shares it with Partner B.
4. Partner B inputs the code and taps **"Connect & Enter Couple Room"**.
5. Select a video from your gallery OR paste a magnet link into the **Super Fast Torrent Downloader**.
6. Both phones will automatically mirror video playback, play/pause, seek, 10s skip/rewind, and torrent download progress in real-time!
