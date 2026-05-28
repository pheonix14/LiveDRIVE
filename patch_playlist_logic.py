import os
import re

filepath = "templates/index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update log() to support PLAYLIST log level
log_search = """            } else if (t === "debug") {
                level = "DEBUG   ";
                color = "var(--muted)"; // gray
            } else if (t === "success" || t === "info") {
                level = "INFO    ";
                color = "var(--gold)"; // gold
            }"""

log_replacement = """            } else if (t === "debug") {
                level = "DEBUG   ";
                color = "var(--muted)"; // gray
            } else if (t === "playlist") {
                level = "PLAYLIST";
                color = "#F2C12E"; // gold
            } else if (t === "success" || t === "info") {
                level = "INFO    ";
                color = "var(--gold)"; // gold
            }"""

content = content.replace(log_search, log_replacement)

# 2. Add ends listener inside YouTube player wrapper
yt_ended_search = """                            } else if (event.data === YT.PlayerState.PAUSED) {
                                const t = ytPlayer.getCurrentTime();
                                broadcastPayload({ type: "pause", position: t });
                                updateRoomPlaybackState(t, false);
                                stopPlaybackSaveInterval();
                                saveCurrentPlaybackPos();
                            }"""

yt_ended_replacement = """                            } else if (event.data === YT.PlayerState.PAUSED) {
                                const t = ytPlayer.getCurrentTime();
                                broadcastPayload({ type: "pause", position: t });
                                updateRoomPlaybackState(t, false);
                                stopPlaybackSaveInterval();
                                saveCurrentPlaybackPos();
                            } else if (event.data === YT.PlayerState.ENDED) {
                                log("YouTube playback ended", "playlist");
                                handleVideoEnded();
                            }"""

content = content.replace(yt_ended_search, yt_ended_replacement)

# 3. Add ends listener inside Vimeo player wrapper
vimeo_ended_search = """                vimeoPlayer.on('timeupdate', (data) => {
                    vimeoTime = data.seconds;
                    vimeoDuration = data.duration;
                });"""

vimeo_ended_replacement = """                vimeoPlayer.on('timeupdate', (data) => {
                    vimeoTime = data.seconds;
                    vimeoDuration = data.duration;
                });
                vimeoPlayer.on('ended', () => {
                    log("Vimeo playback ended", "playlist");
                    handleVideoEnded();
                });"""

content = content.replace(vimeo_ended_search, vimeo_ended_replacement)

# 4. Add ended listener to HTML5 video element
html5_ended_search = """        video.onplaying = () => {"""

html5_ended_replacement = """        video.onended = () => {
            log("Video playback ended", "playlist");
            handleVideoEnded();
        };

        video.onplaying = () => {"""

content = content.replace(html5_ended_search, html5_ended_replacement)

# 5. Inject sync message handlers for playlist_update and playlist_skip
sync_msg_search = """                case "room_expired":
                    log("Room expired notification received from server", "error");
                    triggerRoomTombstone();
                    break;"""

sync_msg_replacement = """                case "room_expired":
                    log("Room expired notification received from server", "error");
                    triggerRoomTombstone();
                    break;

                case "playlist_update":
                    const rUpd = getRoomData(currentRoom);
                    if (rUpd) {
                        rUpd.playlist = data.playlist;
                        rUpd.playlistIndex = data.playlistIndex;
                        if (data.shuffle !== undefined) rUpd.shuffle = data.shuffle;
                        if (data.loopMode !== undefined) rUpd.loopMode = data.loopMode;
                        saveRoomData(currentRoom, rUpd);
                        
                        renderPlaylistPanel();
                        updatePlaylistButtonsState();
                        if (data.shuffle !== undefined) updateShuffleButtonUI(data.shuffle);
                        if (data.loopMode !== undefined) updateLoopButtonUI(data.loopMode);
                    }
                    log("Queue updated from host", "playlist");
                    break;

                case "playlist_skip":
                    log(`Skipped to index ${data.playlistIndex} (synced from host)`, "playlist");
                    loadPlaylistItemFromHost(data.playlistIndex, data.position);
                    break;"""

content = content.replace(sync_msg_search, sync_msg_replacement)

# 6. Replace initPremadeRooms() and metadata to support playlist queues
init_premade_pattern = re.compile(r'function initPremadeRooms\(\) \{.*?let codes = JSON\.parse\(localStorage\.getItem\("ld_premade_codes"\) \|\| "\{\}"\);.*?const now = Date\.now\(\);.*?countInitialized \+= 1;.*?\}\s*\}', re.DOTALL)
init_premade_replacement = """function initPremadeRooms() {
            const premadeMeta = {
                oppenheimer: { 
                    name: "Oppenheimer Rewatch Party", 
                    genre: "Historical Drama", 
                    videoUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg", 
                    host: "atomiccinema", 
                    baseCode: "OPNHMR", 
                    initialViewers: 1247, 
                    floorViewers: 200, 
                    playbackPos: 5040, 
                    defaultCode: "OPNHMR-4A7F",
                    lifetime: "3hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=uYPbbksJxIg", title: "Oppenheimer Official Trailer", duration: "3:08" },
                        { url: "https://www.youtube.com/watch?v=l3oZz4tq98c", title: "Oppenheimer Behind the Scenes", duration: "6:54" },
                        { url: "https://www.youtube.com/watch?v=E52g9Zt2nfs", title: "Oppenheimer Soundtrack Suite", duration: "5:22" }
                    ]
                },
                severance: { 
                    name: "Severance S2 Premiere Night", 
                    genre: "Sci-Fi · Series", 
                    videoUrl: "https://www.youtube.com/watch?v=yKqM_R5T9pE", 
                    host: "inniesanddouties", 
                    baseCode: "SVRNCE", 
                    initialViewers: 892, 
                    floorViewers: 50, 
                    playbackPos: 0, 
                    defaultCode: "SVRNCE-8S2P",
                    lifetime: "24hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=yKqM_R5T9pE", title: "Severance S1 Trailer", duration: "2:20" },
                        { url: "https://www.youtube.com/watch?v=xTsdS8v9RzE", title: "Severance S2 Official Trailer", duration: "2:04" },
                        { url: "https://www.youtube.com/watch?v=1tX_K2K0t3M", title: "Severance Cast Interview", duration: "4:15" }
                    ]
                },
                horror: { 
                    name: "Midnight Horror Marathon", 
                    genre: "Horror", 
                    videoUrl: "https://www.youtube.com/watch?v=hZyS3Qh8t1A", 
                    host: "screammachine", 
                    baseCode: "HORROR", 
                    initialViewers: 543, 
                    floorViewers: 50, 
                    playbackPos: 0, 
                    defaultCode: "HORROR-9M3K",
                    lifetime: "24hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=hZyS3Qh8t1A", title: "Talk to Me Official Trailer", duration: "2:18" },
                        { url: "https://www.youtube.com/watch?v=kYJ-w2t-61M", title: "Smile 2 Official Trailer", duration: "2:15" },
                        { url: "https://www.youtube.com/watch?v=A8K49M2GzHE", title: "The Conjuring Trailer", duration: "2:30" }
                    ]
                },
                romcom: { 
                    name: "Friday Rom-Com Club", 
                    genre: "Romance · Comedy", 
                    videoUrl: "https://www.youtube.com/watch?v=co7a5E9b27k", 
                    host: "popcornqueen", 
                    baseCode: "ROMCOM", 
                    initialViewers: 317, 
                    floorViewers: 50, 
                    playbackPos: 0, 
                    defaultCode: "ROMCOM-3F1C",
                    lifetime: "24hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=co7a5E9b27k", title: "Anyone But You Trailer", duration: "2:24" },
                        { url: "https://www.youtube.com/watch?v=b4wS93Cpx-w", title: "The Idea of You Trailer", duration: "2:35" },
                        { url: "https://www.youtube.com/watch?v=z8aL1m5Jz8Q", title: "La La Land Official Trailer", duration: "2:12" }
                    ]
                },
                anime: { 
                    name: "Anime Night — Attack on Titan Finale", 
                    genre: "Anime", 
                    videoUrl: "https://www.youtube.com/watch?v=E7WdHC2dQ9I", 
                    host: "survey_corps", 
                    baseCode: "ANIME", 
                    initialViewers: 2104, 
                    floorViewers: 50, 
                    playbackPos: 0, 
                    defaultCode: "ANIME-7AOT",
                    lifetime: "24hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=E7WdHC2dQ9I", title: "AoT Season 1 Trailer", duration: "2:10" },
                        { url: "https://www.youtube.com/watch?v=MGRm4IzK1SQ", title: "AoT Season 2 Trailer", duration: "1:55" },
                        { url: "https://www.youtube.com/watch?v=LpT0M1vPZac", title: "AoT Season 3 Trailer", duration: "2:12" },
                        { url: "https://www.youtube.com/watch?v=f_Vp_7I2mU4", title: "AoT Final Season Trailer", duration: "2:30" }
                    ]
                },
                batman: { 
                    name: "The Batman Community Screening", 
                    genre: "Action · Drama", 
                    videoUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4", 
                    host: "darkknightfan", 
                    baseCode: "BATDRV", 
                    initialViewers: 8341, 
                    floorViewers: 200, 
                    playbackPos: 0, 
                    defaultCode: "BATDRV-7F4A",
                    lifetime: "24hours",
                    playlist: [
                        { url: "https://www.youtube.com/watch?v=mqqft2x_Aa4", title: "The Batman Official Trailer", duration: "2:24" },
                        { url: "https://www.youtube.com/watch?v=H6Uo4B9l_aY", title: "The Batman Behind the Scenes", duration: "8:44" },
                        { url: "https://www.youtube.com/watch?v=zJg6BqZq3v4", title: "The Batman Theme Suite", duration: "6:48" }
                    ]
                }
            };

            let codes = JSON.parse(localStorage.getItem("ld_premade_codes") || "{}");
            const now = Date.now();
            let countInitialized = 0;

            for (const key in premadeMeta) {
                const meta = premadeMeta[key];
                let currentCode = codes[key];
                
                let needsSeeding = false;
                if (!currentCode) {
                    currentCode = meta.defaultCode;
                    needsSeeding = true;
                } else {
                    const roomInfo = getRoomData(currentCode);
                    if (!roomInfo) {
                        needsSeeding = true;
                        const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                        currentCode = `${meta.baseCode}-${newSuffix}`;
                    }
                }

                if (needsSeeding) {
                    codes[key] = currentCode;
                    
                    const playlistItems = [];
                    meta.playlist.forEach((pUrl, idx) => {
                        playlistItems.push({
                            id: `pl_${meta.baseCode.toLowerCase()}_00${idx+1}`,
                            url: pUrl.url,
                            title: pUrl.title,
                            source: "youtube",
                            duration: pUrl.duration,
                            addedBy: meta.host,
                            addedAt: now
                        });
                    });

                    const roomInfo = {
                        code: currentCode,
                        name: meta.name,
                        genre: meta.genre,
                        videoUrl: meta.videoUrl,
                        host: meta.host,
                        isPrivate: false,
                        isPremade: true,
                        lifetime: meta.lifetime,
                        selfDestruct: false,
                        lastActivity: now,
                        createdAt: now,
                        members: [],
                        chat: [],
                        simulatedViewers: meta.initialViewers,
                        playback: { position: meta.playbackPos, playing: false, speed: 1 },
                        playlist: playlistItems,
                        playlistIndex: 0,
                        loopMode: "none",
                        shuffle: false
                    };
                    saveRoomData(currentCode, roomInfo);
                    countInitialized++;
                }
            }"""

content = init_premade_pattern.sub(init_premade_replacement, content, count=1)

print("Pre-seeded metadata and events patched...")
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
