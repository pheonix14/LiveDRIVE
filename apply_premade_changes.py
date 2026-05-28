import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add CSS for premade-badge
old_private_badge_css = """        .private-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--muted);
            font-size: .65rem;
            font-weight: 700;
            letter-spacing: .1em;
            padding: .3rem .7rem;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: .35rem;
            z-index: 10;
        }"""

new_premade_badge_css = """        .private-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: var(--muted);
            font-size: .65rem;
            font-weight: 700;
            letter-spacing: .1em;
            padding: .3rem .7rem;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: .35rem;
            z-index: 10;
        }
        .premade-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(242, 193, 46, 0.1);
            border: 1px solid rgba(242, 193, 46, 0.3);
            color: var(--gold);
            font-size: .65rem;
            font-weight: 700;
            letter-spacing: .1em;
            padding: .3rem .7rem;
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: .35rem;
            z-index: 10;
        }"""

if old_private_badge_css in text:
    text = text.replace(old_private_badge_css, new_premade_badge_css)
    print("premade-badge CSS added successfully!")
else:
    print("private-badge CSS NOT found directly!")

# 2. Update Card 1 (Oppenheimer featured card)
# Search pattern for Oppenheimer card
old_oppenheimer = """            <!-- Featured Card (Private Demo Room) -->
            <div class="room-card featured reveal" onclick="showPrivateRoomToast(event)">
                <div class="room-thumb">
                    <div class="thumb-vis thriller">
                        <div class="glow-orb"
                            style="width:250px;height:250px;top:20%;left:10%;background:rgba(242,193,46,.07);filter:blur(60px)">
                        </div>
                        <div class="glow-orb"
                            style="width:150px;height:150px;bottom:5%;right:5%;background:rgba(230,57,70,.05);filter:blur(40px)">
                        </div>
                        <svg style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);opacity:.15"
                            width="200" height="30" viewBox="0 0 200 30"><text x="0" y="22" font-family="Bebas Neue"
                                font-size="28" fill="#F2C12E" letter-spacing="8">OPPENHEIMER</text></svg>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="private-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        PRIVATE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Historical Drama</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Oppenheimer Rewatch Party</div>
                    <div class="room-host">Hosted by <strong>@atomiccinema</strong> · started 1h 24m ago</div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">KJ</div>
                                <div class="avatar" style="background:#0F2B1E;color:#5DCAA5">SL</div>
                                <div class="avatar" style="background:#2B0A0A;color:#F09595">AR</div>
                                <div class="avatar" style="background:#2B1A00;color:#EF9F27">MB</div>
                            </div>
                            <span class="viewers-count"><strong>1,247</strong> watching</span>
                        </div>"""

new_oppenheimer = """            <!-- Featured Card (Premade Room) -->
            <div class="room-card featured reveal" onclick="joinPremadeRoom('oppenheimer')">
                <div class="room-thumb">
                    <div class="thumb-vis thriller">
                        <div class="glow-orb"
                            style="width:250px;height:250px;top:20%;left:10%;background:rgba(242,193,46,.07);filter:blur(60px)">
                        </div>
                        <div class="glow-orb"
                            style="width:150px;height:150px;bottom:5%;right:5%;background:rgba(230,57,70,.05);filter:blur(40px)">
                        </div>
                        <svg style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);opacity:.15"
                            width="200" height="30" viewBox="0 0 200 30"><text x="0" y="22" font-family="Bebas Neue"
                                font-size="28" fill="#F2C12E" letter-spacing="8">OPPENHEIMER</text></svg>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="premade-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        FEATURED
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Historical Drama</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Oppenheimer Rewatch Party</div>
                    <div class="room-host">Hosted by <strong>@atomiccinema</strong> · started 1h 24m ago</div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">KJ</div>
                                <div class="avatar" style="background:#0F2B1E;color:#5DCAA5">SL</div>
                                <div class="avatar" style="background:#2B0A0A;color:#F09595">AR</div>
                                <div class="avatar" style="background:#2B1A00;color:#EF9F27">MB</div>
                            </div>
                            <span class="viewers-count"><strong><span id="viewers-oppenheimer">1,247</span></strong> watching</span>
                        </div>"""

if old_oppenheimer in text:
    text = text.replace(old_oppenheimer, new_oppenheimer)
    print("Oppenheimer card updated successfully!")
else:
    print("Oppenheimer card NOT found directly!")

# 3. Update Card 2 (Severance card)
old_severance = """            <!-- Card 2 (Private Demo Room) -->
            <div class="room-card reveal reveal-delay-1" onclick="showPrivateRoomToast(event)">
                <div class="room-thumb">
                    <div class="thumb-vis scifi">
                        <div class="glow-orb"
                            style="width:160px;height:160px;top:10%;right:10%;background:rgba(29,158,117,.07);filter:blur(40px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="private-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        PRIVATE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Sci-Fi · Series</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Severance S2 Premiere Night</div>
                    <div class="room-host">Hosted by <strong>@inniesanddouties</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#0a1e30;color:#85B7EB">PK</div>
                                <div class="avatar" style="background:#1a2b0a;color:#97C459">RM</div>
                            </div>
                            <span class="viewers-count"><strong>892</strong> watching</span>
                        </div>"""

new_severance = """            <!-- Card 2 (Premade Room) -->
            <div class="room-card reveal reveal-delay-1" onclick="joinPremadeRoom('severance')">
                <div class="room-thumb">
                    <div class="thumb-vis scifi">
                        <div class="glow-orb"
                            style="width:160px;height:160px;top:10%;right:10%;background:rgba(29,158,117,.07);filter:blur(40px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="premade-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        PREMADE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Sci-Fi · Series</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Severance S2 Premiere Night</div>
                    <div class="room-host">Hosted by <strong>@inniesanddouties</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#0a1e30;color:#85B7EB">PK</div>
                                <div class="avatar" style="background:#1a2b0a;color:#97C459">RM</div>
                            </div>
                            <span class="viewers-count"><strong><span id="viewers-severance">892</span></strong> watching</span>
                        </div>"""

if old_severance in text:
    text = text.replace(old_severance, new_severance)
    print("Severance card updated successfully!")
else:
    print("Severance card NOT found directly!")

# 4. Update Card 3 (Horror card)
old_horror = """            <!-- Card 3 (Private Demo Room) -->
            <div class="room-card reveal reveal-delay-2" onclick="showPrivateRoomToast(event)">
                <div class="room-thumb">
                    <div class="thumb-vis horror">
                        <div class="glow-orb"
                            style="width:150px;height:150px;top:20%;left:20%;background:rgba(230,57,70,.06);filter:blur(45px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="private-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        PRIVATE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Horror</div>
                    <div class="live-badge" style="background:rgba(230,57,70,.8)"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Midnight Horror Marathon</div>
                    <div class="room-host">Hosted by <strong>@screammachine</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b0a0a;color:#F09595">HX</div>
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">VY</div>
                                <div class="avatar" style="background:#2b0d1a;color:#ED93B1">CS</div>
                            </div>
                            <span class="viewers-count"><strong>543</strong> watching</span>
                        </div>"""

new_horror = """            <!-- Card 3 (Premade Room) -->
            <div class="room-card reveal reveal-delay-2" onclick="joinPremadeRoom('horror')">
                <div class="room-thumb">
                    <div class="thumb-vis horror">
                        <div class="glow-orb"
                            style="width:150px;height:150px;top:20%;left:20%;background:rgba(230,57,70,.06);filter:blur(45px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="premade-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        PREMADE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Horror</div>
                    <div class="live-badge" style="background:rgba(230,57,70,.8)"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Midnight Horror Marathon</div>
                    <div class="room-host">Hosted by <strong>@screammachine</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b0a0a;color:#F09595">HX</div>
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">VY</div>
                                <div class="avatar" style="background:#2b0d1a;color:#ED93B1">CS</div>
                            </div>
                            <span class="viewers-count"><strong><span id="viewers-horror">543</span></strong> watching</span>
                        </div>"""

if old_horror in text:
    text = text.replace(old_horror, new_horror)
    print("Horror card updated successfully!")
else:
    print("Horror card NOT found directly!")

# 5. Update Card 4 (Rom-com card)
old_romcom = """            <!-- Card 4 (Private Demo Room) -->
            <div class="room-card reveal reveal-delay-1" onclick="showPrivateRoomToast(event)">
                <div class="room-thumb">
                    <div class="thumb-vis romance">
                        <div class="glow-orb"
                            style="width:170px;height:170px;top:30%;left:30%;background:rgba(212,83,126,.06);filter:blur(50px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="private-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        PRIVATE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Romance · Comedy</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Friday Rom-Com Club</div>
                    <div class="room-host">Hosted by <strong>@popcornqueen</strong> · starting soon</div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b0d1a;color:#ED93B1">LN</div>
                                <div class="avatar" style="background:#0a1a2b;color:#85B7EB">OR</div>
                            </div>
                            <span class="viewers-count"><strong>317</strong> joined</span>
                        </div>"""

new_romcom = """            <!-- Card 4 (Premade Room) -->
            <div class="room-card reveal reveal-delay-1" onclick="joinPremadeRoom('romcom')">
                <div class="room-thumb">
                    <div class="thumb-vis romance">
                        <div class="glow-orb"
                            style="width:170px;height:170px;top:30%;left:30%;background:rgba(212,83,126,.06);filter:blur(50px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="premade-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        PREMADE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Romance · Comedy</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Friday Rom-Com Club</div>
                    <div class="room-host">Hosted by <strong>@popcornqueen</strong> · starting soon</div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b0d1a;color:#ED93B1">LN</div>
                                <div class="avatar" style="background:#0a1a2b;color:#85B7EB">OR</div>
                            </div>
                            <span class="viewers-count"><strong><span id="viewers-romcom">317</span></strong> joined</span>
                        </div>"""

if old_romcom in text:
    text = text.replace(old_romcom, new_romcom)
    print("Rom-Com card updated successfully!")
else:
    print("Rom-Com card NOT found directly!")

# 6. Update Card 5 (Anime card)
old_anime = """            <!-- Card 5 (Private Demo Room) -->
            <div class="room-card reveal reveal-delay-2" onclick="showPrivateRoomToast(event)">
                <div class="room-thumb">
                    <div class="thumb-vis action">
                        <div class="glow-orb"
                            style="width:180px;height:180px;top:10%;left:10%;background:rgba(186,117,23,.07);filter:blur(45px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="private-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        PRIVATE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Anime</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Anime Night — Attack on Titan Finale</div>
                    <div class="room-host">Hosted by <strong>@survey_corps</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b1a00;color:#EF9F27">TK</div>
                                <div class="avatar" style="background:#1a2b0a;color:#97C459">AJ</div>
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">YW</div>
                                <div class="avatar" style="background:#2b0a0a;color:#F09595">BM</div>
                            </div>
                            <span class="viewers-count"><strong>2,104</strong> watching</span>
                        </div>"""

new_anime = """            <!-- Card 5 (Premade Room) -->
            <div class="room-card reveal reveal-delay-2" onclick="joinPremadeRoom('anime')">
                <div class="room-thumb">
                    <div class="thumb-vis action">
                        <div class="glow-orb"
                            style="width:180px;height:180px;top:10%;left:10%;background:rgba(186,117,23,.07);filter:blur(45px)">
                        </div>
                    </div>
                    <div class="thumb-overlay"></div>
                    <div class="premade-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        PREMADE
                    </div>
                    <div class="thumb-genre" style="left: 96px;">Anime</div>
                    <div class="live-badge"><span class="dot"></span> LIVE</div>
                    <div class="thumb-play">
                        <div class="play-circle">
                            <div class="play-tri"></div>
                        </div>
                    </div>
                </div>
                <div class="room-body">
                    <div class="room-name">Anime Night — Attack on Titan Finale</div>
                    <div class="room-host">Hosted by <strong>@survey_corps</strong></div>
                    <div class="room-footer">
                        <div class="viewers">
                            <div class="avatar-stack">
                                <div class="avatar" style="background:#2b1a00;color:#EF9F27">TK</div>
                                <div class="avatar" style="background:#1a2b0a;color:#97C459">AJ</div>
                                <div class="avatar" style="background:#2D1B69;color:#AFA9EC">YW</div>
                                <div class="avatar" style="background:#2b0a0a;color:#F09595">BM</div>
                            </div>
                            <span class="viewers-count"><strong><span id="viewers-anime">2,104</span></strong> watching</span>
                        </div>"""

if old_anime in text:
    text = text.replace(old_anime, new_anime)
    print("Anime card updated successfully!")
else:
    print("Anime card NOT found directly!")

# 7. Update Featured Section Batman Room Click Handlers
# Replace Featured Section Batman click events
text = text.replace('onclick="showPrivateRoomToast(event)"', 'onclick="joinPremadeRoom(\'batman\')"')
text = text.replace('onclick="runBtnAsyncAction(this, () => showPrivateRoomToast(event))"', 'onclick="runBtnAsyncAction(this, () => joinPremadeRoom(\'batman\'))"')

# 8. Prepend the new seeding, simulated chat, simulated viewers loop, and joinPremadeRoom functions in <script>
new_premade_js = """
        /* ---------- PREMADE ROOMS LOGIC & SEEDING ---------- */
        let simulatedChatInterval = null;

        function initPremadeRooms() {
            const premadeMeta = {
                oppenheimer: { name: "Oppenheimer Rewatch Party", genre: "Historical Drama", videoUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg", host: "atomiccinema", baseCode: "OPNHMR", initialViewers: 1247, floorViewers: 200, playbackPos: 5040, defaultCode: "OPNHMR-4A7F" },
                severance: { name: "Severance S2 Premiere Night", genre: "Sci-Fi · Series", videoUrl: "https://www.youtube.com/watch?v=34d74zG9_90", host: "inniesanddouties", baseCode: "SVRNCE", initialViewers: 892, floorViewers: 50, playbackPos: 0, defaultCode: "SVRNCE-8S2P" },
                horror: { name: "Midnight Horror Marathon", genre: "Horror", videoUrl: "https://www.youtube.com/watch?v=hZyS3Qh8t1A", host: "screammachine", baseCode: "HORROR", initialViewers: 543, floorViewers: 50, playbackPos: 0, defaultCode: "HORROR-9M3K" },
                romcom: { name: "Friday Rom-Com Club", genre: "Romance · Comedy", videoUrl: "https://www.youtube.com/watch?v=co7a5E9b27k", host: "popcornqueen", baseCode: "ROMCOM", initialViewers: 317, floorViewers: 50, playbackPos: 0, defaultCode: "ROMCOM-3F1C" },
                anime: { name: "Anime Night — Attack on Titan Finale", genre: "Anime", videoUrl: "https://www.youtube.com/watch?v=E7WdHC2dQ9I", host: "survey_corps", baseCode: "ANIME", initialViewers: 2104, floorViewers: 50, playbackPos: 0, defaultCode: "ANIME-7AOT" },
                batman: { name: "The Batman Community Screening", genre: "Action · Drama", videoUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4", host: "darkknightfan", baseCode: "BATDRV", initialViewers: 8341, floorViewers: 200, playbackPos: 0, defaultCode: "BATDRV-7F4A" }
            };

            let codes = JSON.parse(localStorage.getItem("ld_premade_codes") || "{}");
            let seeded = localStorage.getItem("premadeRoomsSeeded");
            const now = Date.now();
            let countInitialized = 0;

            if (!seeded) {
                codes = {};
                for (const key in premadeMeta) {
                    const meta = premadeMeta[key];
                    const code = meta.defaultCode;
                    codes[key] = code;
                    
                    const roomInfo = {
                        code: code,
                        name: meta.name,
                        genre: meta.genre,
                        videoUrl: meta.videoUrl,
                        host: meta.host,
                        isPrivate: false,
                        isPremade: true,
                        lifetime: 1440,
                        selfDestruct: false,
                        lastActivity: now,
                        createdAt: now,
                        members: [],
                        chat: [],
                        simulatedViewers: meta.initialViewers,
                        playback: { position: meta.playbackPos, playing: false, speed: 1 }
                    };
                    saveRoomData(code, roomInfo);
                    countInitialized++;
                }
                localStorage.setItem("ld_premade_codes", JSON.stringify(codes));
                localStorage.setItem("premadeRoomsSeeded", "true");
                log(`Premade rooms seeded       → ${countInitialized} rooms initialized`, "info");
            } else {
                for (const key in premadeMeta) {
                    const meta = premadeMeta[key];
                    let code = codes[key];
                    let roomInfo = code ? getRoomData(code) : null;
                    let expired = false;

                    if (roomInfo) {
                        const elapsed = now - roomInfo.createdAt;
                        if (elapsed >= 24 * 60 * 60 * 1000) {
                            expired = true;
                        }
                    } else {
                        expired = true;
                    }

                    if (expired) {
                        const oldCode = code || meta.defaultCode;
                        
                        if (code) {
                            const roomsData = JSON.parse(localStorage.getItem("ld_rooms") || "{}");
                            delete roomsData[code.toLowerCase()];
                            localStorage.setItem("ld_rooms", JSON.stringify(roomsData));
                        }

                        const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                        const newCode = `${meta.baseCode}-${newSuffix}`;
                        codes[key] = newCode;
                        
                        const newRoomInfo = {
                            code: newCode,
                            name: meta.name,
                            genre: meta.genre,
                            videoUrl: meta.videoUrl,
                            host: meta.host,
                            isPrivate: false,
                            isPremade: true,
                            lifetime: 1440,
                            selfDestruct: false,
                            lastActivity: now,
                            createdAt: now,
                            members: [],
                            chat: [],
                            simulatedViewers: meta.initialViewers,
                            playback: { position: meta.playbackPos, playing: false, speed: 1 }
                        };
                        saveRoomData(newCode, newRoomInfo);
                        localStorage.setItem("ld_premade_codes", JSON.stringify(codes));
                        
                        log(`Premade room reseeded      → ${oldCode}  (expired after 24h)`, "info");
                    }
                }
            }
        }

        function joinPremadeRoom(key) {
            const codes = JSON.parse(localStorage.getItem("ld_premade_codes") || "{}");
            const code = codes[key];
            if (code) {
                roomInput.value = code;
                nameInput.value = myUsername;
                joinRoom();
            } else {
                showToast("Error", "Premade room not found");
            }
        }

        function animateViewerCount(elId, newCount) {
            const el = document.getElementById(elId);
            if (!el) return;
            el.textContent = newCount.toLocaleString();
            el.style.display = 'inline-block';
            el.style.transition = 'transform 0.15s ease-out';
            el.style.transform = 'scale(1.25)';
            el.style.color = 'var(--gold)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
                el.style.color = '';
            }, 150);
        }

        function startSimulatedViewersLoop() {
            const codes = JSON.parse(localStorage.getItem("ld_premade_codes") || "{}");
            const counts = {
                'OPNHMR-4A7F': 1247,
                'SVRNCE-8S2P': 892,
                'HORROR-9M3K': 543,
                'ROMCOM-3F1C': 317,
                'ANIME-7AOT': 2104,
                'BATDRV-7F4A': 8341
            };
            
            const premadeKeys = ['oppenheimer', 'severance', 'horror', 'romcom', 'anime', 'batman'];
            premadeKeys.forEach(k => {
                const currentCode = codes[k];
                if (currentCode) {
                    const room = getRoomData(currentCode);
                    if (room && room.simulatedViewers) {
                        counts[currentCode] = room.simulatedViewers;
                    }
                }
            });

            function tick() {
                const currentCodes = JSON.parse(localStorage.getItem("ld_premade_codes") || "{}");
                premadeKeys.forEach(k => {
                    const code = currentCodes[k];
                    if (!code) return;
                    
                    const room = getRoomData(code);
                    if (!room) return;
                    
                    let curCount = room.simulatedViewers || counts[code] || 100;
                    const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
                    curCount += delta;
                    
                    const floor = (k === 'oppenheimer' || k === 'batman') ? 200 : 50;
                    if (curCount < floor) curCount = floor;
                    
                    room.simulatedViewers = curCount;
                    saveRoomData(code, room);
                    counts[code] = curCount;
                    
                    const spanId = `viewers-${k}`;
                    animateViewerCount(spanId, curCount);
                    
                    if (joined && currentRoom.toLowerCase() === code.toLowerCase()) {
                        const headerMemberCount = document.getElementById("headerMemberCount");
                        if (headerMemberCount) {
                            const realCount = (room.peers && room.peers.length > 0) ? room.peers.length : 1;
                            const totalCount = curCount + realCount;
                            headerMemberCount.textContent = `${totalCount.toLocaleString()} members`;
                        }
                    }
                    
                    log(`Simulated viewer update    → ${code}  viewers: ${curCount}`, "sim");
                });
                
                const nextDelay = (Math.floor(Math.random() * 5) + 8) * 1000;
                setTimeout(tick, nextDelay);
            }
            
            setTimeout(tick, 8000);
        }

        function startSimulatedChat(roomCode) {
            if (simulatedChatInterval) clearTimeout(simulatedChatInterval);
            
            const room = getRoomData(roomCode);
            if (!room || !room.isPremade) return;
            
            const genre = room.genre.toLowerCase();
            let pool = [];
            
            if (genre.includes("historical") || genre.includes("drama")) {
                if (genre.includes("action")) {
                    pool = [
                        "the dark knight rises is nothing compared to this",
                        "this screening is packed lol",
                        "vibe is unmatched",
                        "love the cinematic tone"
                    ];
                } else {
                    pool = [
                        "the practical effects are insane",
                        "Cillian Murphy carrying this whole film",
                        "the trinity scene every time man",
                        "no CGI and it still looks unreal"
                    ];
                }
            } else if (genre.includes("horror")) {
                pool = [
                    "DO NOT OPEN THAT DOOR",
                    "I am not okay",
                    "turned my lights on lol",
                    "that jump scare got me"
                ];
            } else if (genre.includes("anime")) {
                pool = [
                    "they really did that",
                    "I am not crying you are crying",
                    "MAPPA really said no mercy",
                    "the soundtrack alone"
                ];
            } else if (genre.includes("romance") || genre.includes("comedy")) {
                pool = [
                    "this is so cute",
                    "finally a good one",
                    "the lead chemistry is everything"
                ];
            } else if (genre.includes("sci-fi") || genre.includes("scifi") || genre.includes("series")) {
                pool = [
                    "the lore goes so deep",
                    "Lumon is actually terrifying",
                    "nobody is normal in this show"
                ];
            } else {
                pool = ["vibing in this room", "quality looks great", "sync is perfect"];
            }

            function sendSimulatedMessage() {
                if (!joined || currentRoom.toLowerCase() !== roomCode.toLowerCase()) {
                    return;
                }

                const msg = pool[Math.floor(Math.random() * pool.length)];
                const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                const noun = nouns[Math.floor(Math.random() * nouns.length)];
                const num = Math.floor(Math.random() * 900) + 100;
                const simUser = `${adj}${noun}_${num}`;
                const simColor = neonColors[Math.floor(Math.random() * neonColors.length)];
                
                renderChatMessage({
                    name: simUser,
                    color: simColor,
                    msg: msg
                });
                
                const nextDelay = (Math.floor(Math.random() * 11) + 10) * 1000;
                simulatedChatInterval = setTimeout(sendSimulatedMessage, nextDelay);
            }
            
            const firstDelay = (Math.floor(Math.random() * 11) + 10) * 1000;
            simulatedChatInterval = setTimeout(sendSimulatedMessage, firstDelay);
        }
"""

text = text.replace("<script>", "<script>" + new_premade_js)

# 9. Update joinRoom() to log simulation message and start simulated chat, and update exitRoom to clean up simulated chat
old_join_log_part = """            log(n + " joined the room", "connection");
            transitionToTheater();
            connectToRoomSync(r);"""

new_join_log_part = """            log(n + " joined the room", "connection");
            transitionToTheater();
            connectToRoomSync(r);

            if (rData && rData.isPremade) {
                log(`${n} joined       → ${rData.code}  (premade)`, "join");
                startSimulatedChat(rData.code);
            }"""

if old_join_log_part in text:
    text = text.replace(old_join_log_part, new_join_log_part)
    print("joinRoom logs updated for simulated chat successfully!")
else:
    # Try loose match
    print("joinRoom logs updated failed!")

# Update exitRoom to clear simulatedChatInterval
old_exit_room_part = """        function exitRoom() {
            if (joined) {
                broadcastPayload({
                    type: "system_leave",
                    senderId: myId,
                    name: myUsername
                });"""

new_exit_room_part = """        function exitRoom() {
            if (simulatedChatInterval) {
                clearTimeout(simulatedChatInterval);
                simulatedChatInterval = null;
            }
            if (joined) {
                broadcastPayload({
                    type: "system_leave",
                    senderId: myId,
                    name: myUsername
                });"""

if old_exit_room_part in text:
    text = text.replace(old_exit_room_part, new_exit_room_part)
    print("exitRoom clear simulatedChatInterval added successfully!")
else:
    print("exitRoom clear simulatedChatInterval failed!")

# 10. Run initPremadeRooms() and startSimulatedViewersLoop() inside DOMContentLoaded
old_dom_content_loaded = """            // Expiry/Destruct periodic checkers
            checkAndPurgeRooms();
            setInterval(checkAndPurgeRooms, 60000);"""

new_dom_content_loaded = """            // Seed premade rooms
            initPremadeRooms();
            startSimulatedViewersLoop();

            // Expiry/Destruct periodic checkers
            checkAndPurgeRooms();
            setInterval(checkAndPurgeRooms, 60000);"""

if old_dom_content_loaded in text:
    text = text.replace(old_dom_content_loaded, new_dom_content_loaded)
    print("initPremadeRooms and startSimulatedViewersLoop hooks added to DOMContentLoaded successfully!")
else:
    print("DOMContentLoaded hooks failed!")

# 11. Hide detonate button and disable lifetime edits in openRoomSettings
old_open_settings = """            if (select) {
                select.value = room.lifetime;
                select.disabled = !room.isHost;
            }

            if (hostSec) {
                if (room.isHost) {
                    hostSec.classList.remove("hidden");
                } else {
                    hostSec.classList.add("hidden");
                }
            }"""

new_open_settings = """            if (select) {
                select.value = room.lifetime;
                select.disabled = !room.isHost || room.isPremade;
            }

            if (hostSec) {
                if (room.isHost && !room.isPremade) {
                    hostSec.classList.remove("hidden");
                } else {
                    hostSec.classList.add("hidden");
                }
            }"""

if old_open_settings in text:
    text = text.replace(old_open_settings, new_open_settings)
    print("openRoomSettings updated successfully!")
else:
    print("openRoomSettings update failed!")

with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("PREMADE CHANGES APPLIED TO templates/index.html!")
