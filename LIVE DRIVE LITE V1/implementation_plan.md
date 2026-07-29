# Architecture & Implementation Plan: Couple Sync Video Player & Torrent Downloader APK

A high-performance, low-latency Android application designed for exactly two connected devices (Couple Mode). Features real-time video playback synchronization, integrated native LibVLC video decoding engine, high-speed C++ LibTorrent stream/downloader, synced magnet link sharing, and an overlay chat interface.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Device A [Partner A - Android APK]
        UI_A[Android UI / Compose Layer]
        Chat_A[Overlay Chat Window]
        VLC_A[LibVLC Engine (C/C++)]
        Torrent_A[LibTorrent Native Engine]
        Sync_A[Sync Manager / RTC Engine]
    end

    subgraph Peer-to-Peer / Signaling Infrastructure
        SigServer[Lightweight Signaling / Relay Server (Node.js/Go WebSockets)]
        STUN[STUN / TURN NAT Traversal]
    end

    subgraph Device B [Partner B - Android APK]
        UI_B[Android UI / Compose Layer]
        Chat_B[Overlay Chat Window]
        VLC_B[LibVLC Engine (C/C++)]
        Torrent_B[LibTorrent Native Engine]
        Sync_B[Sync Manager / RTC Engine]
    end

    Sync_A <-->|Signaling & Pairing| SigServer
    Sync_B <-->|Signaling & Pairing| SigServer
    Sync_A <==>|WebRTC DataChannel / Low-Latency P2P Direct Connection| Sync_B

    Torrent_A <==>|Torrent Swarm P2P Data Exchange| Torrent_B
    Torrent_A <==>|BitTorrent Swarm| BT_Network[BitTorrent Peers / Trackers]
    Torrent_B <==>|BitTorrent Swarm| BT_Network
```

---

## 2. Core Architectural Pillars

### A. Media Decoding & Playback Engine (LibVLC Native C/C++)
* **Engine**: Integrated `org.videolan.libvlc` (LibVLC Android SDK) compiled with native C/C++ decoders (`ffmpeg`, `hardware acceleration via MediaCodec`).
* **Capabilities**: Support for all audio/video containers (MKV, MP4, AVI, MOV, FLV, TS, WebM) and internal/external sub-titles (.srt, .ass, .vtt).
* **Sequential Streaming Engine**: Reads directly from local stream endpoints served by the internal LibTorrent HTTP local proxy (`http://127.0.0.1:8080/stream`).

### B. High-Speed Torrent Downloader & Stream-Play
* **Engine**: Native `libtorrent-rasterbar` (C++ via JNI wrapper or Java bindings `jlibtorrent`).
* **Sequential Download Mode**: Prioritize initial and final pieces of video files to enable instant playback without waiting for full download completion.
* **Storage Path**: Direct write access to scoped storage (`Android/data/org.couple.syncplayer/files/Downloads` or user-chosen Media Directory).

### C. Low-Latency Real-Time Sync State Machine
* **Transport Protocol**: WebRTC DataChannels for sub-50ms peer-to-peer sync. Fallback to WebSocket relay server if strict symmetric NAT blocks direct P2P.
* **Drift Correction Algorithm**:
  - Timestamp drift check every 1000ms.
  - If drift $< 300\text{ ms}$: Soft adjustment via micro-playback rate scaling ($0.98\times \leftrightarrow 1.02\times$).
  - If drift $> 300\text{ ms}$: Hard seek alignment.
* **Mirrored Commands**:
  - `PLAY`, `PAUSE`, `SEEK(seconds)`, `SKIP_10S`, `REWIND_10S`, `SPEED_CHANGE(x)`.
  - `ADD_TORRENT(magnet_uri, info_hash)`: Triggers automatic torrent addition & high-speed download on the partner's device.

### D. Overlay Chat & UI Control Layer
* **Collapsible UI**: Floating/collapsible chat drawer with a dedicated **"Hide Chat" / "Show Chat"** toggle button.
* **Unread Indicator**: Badge count and subtle notification toast when chat is hidden.
* **Modern UI**: Jetpack Compose UI with glassmorphism overlays and dark ambient media layout.

---

## 3. Required Android Permissions Manifest & Justifications

| Permission String | Purpose / Justification |
| :--- | :--- |
| `READ_MEDIA_VIDEO` / `READ_MEDIA_AUDIO` | Access local gallery & downloaded video files (Android 13+). |
| `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` | Storage access for media & torrent downloads (Android 12 and below). |
| `MANAGE_EXTERNAL_STORAGE` | (Optional) High-performance torrent storage access across external SD cards/folders. |
| `INTERNET` & `ACCESS_NETWORK_STATE` | Real-time P2P sync, signaling server link, BitTorrent swarm peer connections. |
| `FOREGROUND_SERVICE` & `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Uninterrupted video playback & sync while app is in background/picture-in-picture. |
| `POST_NOTIFICATIONS` | Download progress notifications & player foreground service controls. |
| `WAKE_LOCK` | Prevent screen sleep during movie watching session. |

---

## 4. Dual Mirroring & Sync Protocol Specifications

### Playback Synchronization Packet Format (JSON / Protocol Buffers)
```json
{
  "event": "SYNC_STATE",
  "roomId": "CP-982301",
  "senderId": "user_a",
  "timestamp": 1753831200000,
  "payload": {
    "action": "PLAY | PAUSE | SEEK | SPEED | ADD_TORRENT",
    "videoDurationMs": 7240000,
    "currentPositionMs": 1420500,
    "playbackRate": 1.0,
    "torrentInfoHash": "a1b2c3d4e5f6...",
    "magnetUrl": "magnet:?xt=urn:btih:a1b2c3d4e5f6..."
  }
}
```

---

## 5. Concise Implementation Checklist

### Approach
Build a native Android application in Kotlin using Jetpack Compose, wrapping C/C++ LibVLC for robust media playback and LibTorrent-Rasterbar for high-speed torrent streaming. Partner devices communicate via WebRTC/WebSocket signaling to achieve dual video playback sync, automatic torrent sharing, and an overlay chat.

### Scope
- **In Scope**:
  - Android APK target.
  - LibVLC media player with controls (Play, Pause, Skip 10s, Rewind 10s, Seek bar, Duration matching).
  - High-speed sequential torrent downloading & local HTTP streaming wrapper.
  - 2-Player room pairing system via 6-digit Invite Code.
  - Mirrored Playback Commands & Mirrored Torrent Auto-Download.
  - Floating Chat drawer with Hide/Show Toggle button.
  - Android runtime permissions request flow.
- **Out of Scope**:
  - iOS build (focusing strictly on Android APK as requested).
  - Multi-user rooms $> 2$ participants (strictly locked to Couple Mode: 2 users).

---

## 6. Action Items (Atomic Task List)

- [ ] **Step 1: Project Setup & Native LibVLC / LibTorrent Integration**
  - Initialize Android Kotlin project (Jetpack Compose).
  - Add LibVLC Android SDK dependency (`org.videolan.android:libvlc-all`).
  - Add `jlibtorrent` / LibTorrent C++ library binaries for native fast download.

- [ ] **Step 2: App Permissions & Storage Layer**
  - Configure `AndroidManifest.xml` with Media, Internet, Storage, and Foreground Service permissions.
  - Implement runtime permissions request dialog for Video/Files and Notifications.

- [ ] **Step 3: Torrent Streaming Engine (`TorrentStreamService`)**
  - Implement sequential piece download logic in LibTorrent wrapper.
  - Build local embedded HTTP server (`NanoHTTPD` / `Ktor Server`) to stream downloading torrent files directly to LibVLC player URL.

- [ ] **Step 4: LibVLC Video Player Engine & Custom Controls**
  - Create `VLCPlayerView` wrapper using LibVLC `MediaPlayer` API.
  - Build custom playback UI overlay: Play, Pause, Rewind 10s, Forward 10s, Dynamic Duration bar, Speed selector.

- [ ] **Step 5: Signaling Server & 2-User Pairing Module**
  - Set up lightweight WebSockets signaling server (Node.js/Go) for room creation and 6-digit invite code validation (`Max Capacity: 2`).
  - Implement WebRTC DataChannel connection manager for sub-50ms peer communication.

- [ ] **Step 6: Real-Time Playback & Torrent Mirror Sync Engine**
  - Implement `SyncManager` state machine: broadcast play/pause/seek events to partner.
  - Implement Torrent Mirroring: automatically add & begin torrent download when partner starts a torrent.
  - Add continuous clock drift detection and micro-adjustment ($0.98\times - 1.02\times$).

- [ ] **Step 7: In-Player Chat & Hide/Show Toggle System**
  - Build collapsible Chat Overlay component with Message Input, Chat History, and unread notification badge.
  - Add explicit **"Hide Chat" / "Show Chat"** toggle button floating action button.

- [ ] **Step 8: Verification, Build & APK Packaging**
  - Validate local video playback and torrent streaming.
  - Run sync drift test across two Android emulators/devices.
  - Generate release APK package using Gradle assembleRelease.

---

## 7. Open Questions

1. **Signaling Backend Hosting**: Would you prefer the signaling relay server hosted on a free cloud service (e.g., Render / Railway / Supabase Realtime) or packaged as a simple one-click script to run on your own VPS?
2. **Torrent File Storage**: Should downloaded video files automatically persist in your phone's default Movies folder after watching, or automatically clean up temporary files to save phone storage?
