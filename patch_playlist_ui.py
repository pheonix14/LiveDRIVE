import os
import re

filepath = "templates/index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject Styles
style_search = """        .destruction-scanline {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 10px;
            background: rgba(230, 57, 70, 0.2);
            box-shadow: 0 0 20px rgba(230, 57, 70, 0.6);
            animation: scanline-corrupt 2s linear infinite;
        }"""

style_replacement = """        .destruction-scanline {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 10px;
            background: rgba(230, 57, 70, 0.2);
            box-shadow: 0 0 20px rgba(230, 57, 70, 0.6);
            animation: scanline-corrupt 2s linear infinite;
        }

        /* PLAYLIST ENHANCEMENTS STYLING */
        .playlist-panel {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 320px;
            background: rgba(15, 15, 26, 0.95);
            backdrop-filter: blur(15px);
            border-left: 1px solid var(--border);
            z-index: 45;
            display: flex;
            flex-direction: column;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .playlist-panel.open {
            transform: translateX(0);
        }
        .playlist-items {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem 0;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .playlist-row {
            display: flex;
            align-items: center;
            padding: 0.6rem 0.8rem;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            border-left: 3px solid transparent;
            transition: all 0.2s;
            user-select: none;
            gap: 0.5rem;
        }
        .playlist-row.active {
            background: rgba(242, 193, 46, 0.05);
            border-left-color: var(--gold);
        }
        .playlist-row.dragging {
            opacity: 0.4;
            background: rgba(255, 255, 255, 0.05);
        }
        .playlist-row.drag-over {
            border-top: 2px solid var(--gold);
            background: rgba(242, 193, 46, 0.02);
        }
        .playlist-row:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .playlist-thumb {
            width: 36px;
            height: 24px;
            border-radius: 3px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.6rem;
            font-weight: bold;
            color: #fff;
        }
        .playlist-title {
            flex: 1;
            font-size: 0.8rem;
            color: var(--cream);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
        }
        .playlist-row.active .playlist-title {
            color: var(--gold);
        }
        .playlist-badge {
            font-size: 0.6rem;
            font-weight: 700;
            padding: 0.15rem 0.35rem;
            border-radius: 3px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .playlist-badge.yt { background: #3c0000; color: #ff3333; border: 1px solid rgba(255, 51, 51, 0.2); }
        .playlist-badge.vimeo { background: #002d3c; color: #1ab7ea; border: 1px solid rgba(26, 183, 234, 0.2); }
        .playlist-badge.drive { background: #3c2a00; color: #ffaa00; border: 1px solid rgba(255, 170, 0, 0.2); }
        .playlist-badge.hls { background: #003c14; color: #00ff55; border: 1px solid rgba(0, 255, 85, 0.2); }
        .playlist-badge.mp4 { background: #28003c; color: #cc33ff; border: 1px solid rgba(204, 51, 255, 0.2); }
        .playlist-badge.other { background: #1f1f2e; color: var(--muted); border: 1px solid var(--border); }

        .playlist-duration {
            font-size: 0.7rem;
            color: var(--muted);
            font-family: monospace;
        }
        .playlist-remove-btn {
            background: transparent;
            border: none;
            color: var(--muted);
            cursor: pointer;
            padding: 0.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            transition: color 0.2s;
        }
        .playlist-remove-btn:hover {
            color: var(--red);
        }
        .drag-handle {
            cursor: grab;
            color: var(--muted);
            font-size: 0.85rem;
            padding: 0.2rem;
        }
        .drag-handle:active {
            cursor: grabbing;
        }

        /* Equalizer Bouncing Bars */
        .eq-container {
            display: flex;
            align-items: flex-end;
            width: 12px;
            height: 12px;
            gap: 2px;
            flex-shrink: 0;
        }
        .eq-bar {
            width: 2px;
            height: 2px;
            background: var(--gold);
            animation: bounce-eq 0.8s ease-in-out infinite alternate;
        }
        .eq-bar.bar2 {
            animation-duration: 0.5s;
            animation-delay: 0.15s;
        }
        .eq-bar.bar3 {
            animation-duration: 0.7s;
            animation-delay: 0.3s;
        }
        @keyframes bounce-eq {
            0% { height: 2px; }
            100% { height: 12px; }
        }

        @keyframes slide-in-row {
            from { transform: translateX(30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .slide-in {
            animation: slide-in-row 0.3s ease-out forwards;
        }

        @media(max-width: 900px) {
            .playlist-panel {
                top: auto;
                right: 0;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 65%;
                border-left: none;
                border-top: 1px solid var(--border);
                transform: translateY(100%);
            }
            .playlist-panel.open {
                transform: translateY(0);
            }
        }"""

content = content.replace(style_search, style_replacement)

# 2. Inject Buttons
buttons_search = """                                <!-- Custom Volume Slider -->
                                <input id="volumeSlider" type="range" min="0" max="100" value="100" oninput="setPlayerVolume(this.value)" style="width: 50px; height: 3px; accent-color: var(--gold); background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer;">
                                
                                <span id="timeDisplay" style="font-family: monospace; font-size: 0.8rem; color: var(--cream);">0:00 / 0:00</span>
                            </div>

                            <div style="display: flex; align-items: center; gap: 1rem;">"""

buttons_replacement = """                                <!-- Custom Volume Slider -->
                                <input id="volumeSlider" type="range" min="0" max="100" value="100" oninput="setPlayerVolume(this.value)" style="width: 50px; height: 3px; accent-color: var(--gold); background: rgba(255,255,255,0.1); border-radius: 2px; cursor: pointer;">
                                
                                <span id="timeDisplay" style="font-family: monospace; font-size: 0.8rem; color: var(--cream);">0:00 / 0:00</span>
                            </div>

                            <!-- PLAYLIST QUEUE & CONTROLS -->
                            <div class="playlist-controls" style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; justify-content: center; z-index: 10;">
                                <!-- Previous Button -->
                                <button class="btn-control disabled-btn" id="prevBtn" onclick="playPreviousItem()" title="Previous Video" style="opacity: 0.3;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                        <line x1="5" y1="19" x2="5" y2="5"></line>
                                    </svg>
                                </button>

                                <!-- Shuffle Button -->
                                <button class="btn-control" id="shuffleBtn" onclick="toggleShuffle()" title="Shuffle Playlist">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="16 3 21 3 21 8"></polyline>
                                        <line x1="4" y1="20" x2="21" y2="3"></line>
                                        <polyline points="21 16 21 21 16 21"></polyline>
                                        <line x1="15" y1="15" x2="21" y2="21"></line>
                                        <line x1="4" y1="4" x2="9" y2="9"></line>
                                    </svg>
                                </button>

                                <!-- Loop Button -->
                                <div class="tooltip" style="position: relative; display: inline-block;">
                                    <button class="btn-control" id="loopBtn" onclick="cycleLoopMode()" style="position: relative;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="17 1 21 5 17 9"></polyline>
                                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                            <polyline points="7 23 3 19 7 15"></polyline>
                                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                        </svg>
                                        <span id="loopModeBadge" class="hidden" style="position: absolute; top: 1px; right: 1px; font-size: 0.5rem; background: var(--gold); color: #07070D; padding: 0.05rem 0.15rem; border-radius: 2px; font-weight: 900; line-height: 1;">1</span>
                                    </button>
                                    <span class="tooltiptext" id="loopTooltipText">No Loop — plays once and stops</span>
                                </div>

                                <!-- Next Button -->
                                <button class="btn-control disabled-btn" id="nextBtn" onclick="playNextItem()" title="Next Video" style="opacity: 0.3;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                        <line x1="19" y1="5" x2="19" y2="19"></line>
                                    </svg>
                                </button>

                                <!-- Playlist Toggle Button -->
                                <button class="btn-control" id="playlistToggleBtn" onclick="togglePlaylistPanel()" title="Toggle Playlist Queue" style="position: relative; display: flex; align-items: center; justify-content: center; gap: 0.3rem; width: auto !important; min-width: 54px !important; padding: 0 0.5rem !important;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6"></line>
                                        <line x1="8" y1="12" x2="21" y2="12"></line>
                                        <line x1="8" y1="18" x2="21" y2="18"></line>
                                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                    <span id="playlistBadge" style="font-size: 0.65rem; font-weight: 700; color: var(--cream); background: rgba(255,255,255,0.08); padding: 0.1rem 0.3rem; border-radius: 4px; border: 1px solid var(--border);">PL 0</span>
                                </button>
                            </div>

                            <div style="display: flex; align-items: center; gap: 1rem;">"""

content = content.replace(buttons_search, buttons_replacement)

# 3. Inject Overlay Panels inside video-container
overlay_search = """                    <video id="video" muted playsinline preload="metadata"></video>
                    
                    <!-- YouTube / Vimeo / Twitch iframe container -->
                    <div id="iframePlayerContainer" class="hidden" style="width: 100%; height: 100%; position: absolute; inset: 0; background: black; z-index: 5;"></div>"""

overlay_replacement = """                    <video id="video" muted playsinline preload="metadata"></video>
                    
                    <!-- YouTube / Vimeo / Twitch iframe container -->
                    <div id="iframePlayerContainer" class="hidden" style="width: 100%; height: 100%; position: absolute; inset: 0; background: black; z-index: 5;"></div>

                    <!-- PLAYLIST PANEL OVERLAY -->
                    <div id="playlistPanel" class="playlist-panel">
                        <div class="playlist-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                            <h3 style="font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--gold); letter-spacing: 0.05em; margin: 0;">QUEUE (<span id="queueCount">0</span>)</h3>
                            <button class="copy-btn" onclick="clearPlaylist()" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; color: var(--red); border-color: rgba(230, 57, 70, 0.3); background: rgba(230, 57, 70, 0.05); font-family: 'DM Sans', sans-serif;">Clear All</button>
                        </div>
                        <div id="playlistItems" class="playlist-items">
                            <!-- Populated dynamically -->
                        </div>
                        <div class="playlist-footer" style="padding: 1rem; border-top: 1px solid var(--border); background: var(--bg2);">
                            <div style="font-size: 0.72rem; color: var(--muted); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: bold;">Add to Queue</div>
                            <form onsubmit="submitQueueItem(event)" style="display: flex; gap: 0.5rem;">
                                <input id="queueUrlInput" class="form-input" style="padding: 0.4rem 0.6rem; font-size: 0.8rem; background: var(--bg3); color: var(--cream);" placeholder="Paste video URL...">
                                <button type="submit" class="btn-gold" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; white-space: nowrap;">Add</button>
                            </form>
                        </div>
                    </div>

                    <!-- END OF QUEUE OVERLAY -->
                    <div id="endOfQueueOverlay" class="hidden" style="position: absolute; inset: 0; background: rgba(7, 7, 13, 0.95); z-index: 15; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
                        <div style="font-family: 'Bebas Neue', sans-serif; font-size: 3rem; color: var(--gold); letter-spacing: 0.1em; margin-bottom: 1.5rem; text-shadow: 0 0 20px var(--glow);">END OF QUEUE</div>
                        <button class="btn-gold" style="padding: 0.6rem 1.5rem; font-size: 0.9rem;" onclick="restartQueue()">Restart Queue</button>
                    </div>

                    <!-- UP NEXT TOAST -->
                    <div id="upNextToast" class="hidden" style="position: absolute; bottom: 80px; right: 20px; background: var(--bg2); border: 1px solid var(--gold); border-radius: 6px; padding: 0.8rem 1.2rem; z-index: 100; display: flex; align-items: center; gap: 1.2rem; box-shadow: 0 4px 25px rgba(0,0,0,0.6); animation: slide-in-row 0.2s ease-out;">
                        <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                            <span style="font-size: 0.62rem; color: var(--gold); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">Up Next in 2s</span>
                            <span id="upNextTitle" style="font-size: 0.8rem; color: var(--cream); font-weight: 500; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Loading next...</span>
                        </div>
                        <button class="copy-btn" onclick="cancelAutoplay()" style="color: var(--red); border-color: rgba(230, 57, 70, 0.3); font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(230, 57, 70, 0.05); font-family: 'DM Sans', sans-serif;">Cancel</button>
                    </div>"""

content = content.replace(overlay_search, overlay_replacement)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Playlist UI Elements Patched successfully!")
