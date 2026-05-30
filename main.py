import os
import sys
import uuid
import datetime
import time
import requests
import json
import threading
import urllib.request
from flask import Flask, render_template, send_from_directory, request, Response
from flask_socketio import SocketIO, emit, join_room, leave_room

# Enable ANSI escape sequences on Windows command prompt
if sys.platform == 'win32':
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass

class ColoredLogger:
    # ANSI escape codes for colors
    GREEN = '\033[92m'    # Success (Green)
    BLUE = '\033[94m'     # Download (Blue)
    PURPLE = '\033[95m'   # Upload/Load (Purple)
    YELLOW = '\033[93m'   # Connection/Seek (Yellow)
    CYAN = '\033[96m'     # Play (Cyan)
    RED = '\033[91m'      # Pause (Red)
    WHITE = '\033[97m'    # Info (White)
    ENDC = '\033[0m'      # Reset
    BOLD = '\033[1m'

    @staticmethod
    def _log(prefix, color, message, *args):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted_msg = message
        if args:
            formatted_msg = f"{message} " + " ".join(map(str, args))
        print(f"{ColoredLogger.BOLD}[{timestamp}]{ColoredLogger.ENDC} {color}{ColoredLogger.BOLD}[{prefix}]{ColoredLogger.ENDC} {color}{formatted_msg}{ColoredLogger.ENDC}")

    @classmethod
    def success(cls, message, *args):
        cls._log("SUCCESS", cls.GREEN, message, *args)

    @classmethod
    def download(cls, message, *args):
        cls._log("DOWNLOAD", cls.BLUE, message, *args)

    @classmethod
    def upload(cls, message, *args):
        cls._log("UPLOAD", cls.PURPLE, message, *args)

    @classmethod
    def play(cls, message, *args):
        cls._log("PLAY", cls.CYAN, message, *args)

    @classmethod
    def pause(cls, message, *args):
        cls._log("PAUSE", cls.RED, message, *args)

    @classmethod
    def seek(cls, message, *args):
        cls._log("SEEK", cls.YELLOW, message, *args)

    @classmethod
    def connection(cls, message, *args):
        cls._log("CONNECTION", cls.YELLOW, message, *args)

    @classmethod
    def info(cls, message, *args):
        cls._log("INFO", cls.WHITE, message, *args)

    @classmethod
    def chat(cls, message, *args):
        cls._log("CHAT", cls.PURPLE, message, *args)


# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, "storage")
os.makedirs(VIDEO_DIR, exist_ok=True)

# ---------- App ----------
app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret"

# 🔥 CRITICAL: force threading + polling (Replit fix)
socketio = SocketIO(
    app,
    async_mode="threading",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# ---------- State ----------
room_states = {
    "testroom": {
        "is_playing": False,
        "time": 0.0,
        "video": "testroom_q1_mgr.mp4",
        "queue": ["testroom_q1_mgr.mp4"],
        "last_updated": time.time(),
        "users": []
    }
}
users = {}

# ---------- Helpers ----------
def get_room_time(room_name: str) -> float:
    state = room_states.get(room_name)
    if not state:
        return 0.0
    if state["is_playing"] and state.get("last_updated"):
        elapsed = time.time() - state["last_updated"]
        return state["time"] + elapsed
    return state["time"]

def drive_to_direct(url: str) -> str:
    if "drive.google.com" not in url:
        return url
    file_id = url.split("/file/d/")[1].split("/")[0]
    return f"https://drive.google.com/uc?export=download&id={file_id}"

def download_video(url: str, room_name: str) -> str:
    ColoredLogger.download("Download requested in room:", room_name, "url:", url)
    direct = drive_to_direct(url)

    # Create room folder inside storage
    room_dir = os.path.join(VIDEO_DIR, room_name)
    os.makedirs(room_dir, exist_ok=True)

    # Determine filename using queue length of the room
    queue_len = len(room_states.get(room_name, {}).get("queue", []))
    filename = f"{room_name}_q{queue_len + 1}_{uuid.uuid4().hex[:6]}.mp4"
    path = os.path.join(room_dir, filename)

    r = requests.get(direct, stream=True, timeout=120)
    r.raise_for_status()

    with open(path, "wb") as f:
        for chunk in r.iter_content(8192):
            if chunk:
                f.write(chunk)

    ColoredLogger.success("Downloaded for room:", room_name, "filename:", filename)
    return filename

# ---------- Routes ----------
@app.route("/")
def index():
    ColoredLogger.info("Page loaded")
    return render_template("index.html")

@app.route("/load", methods=["POST"])
def load_video():
    data = request.json
    room = data.get("room", "default")
    ColoredLogger.upload("load called for room:", room, "data:", data)

    if room not in room_states:
        room_states[room] = {
            "is_playing": False,
            "time": 0.0,
            "video": None,
            "queue": [],
            "last_updated": time.time(),
            "users": []
        }

    filename = download_video(data["url"], room)
    
    room_states[room].update({
        "video": filename,
        "time": 0.0,
        "is_playing": False,
        "last_updated": time.time()
    })
    room_states[room]["queue"].append(filename)

    socketio.emit("video_loaded", {"video": filename, "room": room}, to=room)
    return {"ok": True}

@app.route("/video/<room_name>/<name>")
def serve_video(room_name, name):
    room_dir = os.path.join(VIDEO_DIR, room_name)
    return send_from_directory(room_dir, name)


# ──────────────────────────────────────────────
# AWAKE WATCHDOG INTEGRATION
# ──────────────────────────────────────────────
TARGETS_FILE = os.path.join(BASE_DIR, "targets.json")

BUILTIN_TARGETS = [
    {
        "url": "https://xtreme-f6jh.onrender.com",
        "label": "CORE PULSE",
        "is_active": True
    },
    {
        "url": "https://xtreme-f6jh.onrender.com/hook",
        "label": "TELEMETRY HOOK",
        "is_active": True
    },
]

def make_target(url, label="", is_active=True):
    return {
        "url": url,
        "pings": 0,
        "success": 0,
        "last_ping": None,
        "is_active": is_active,
        "label": label
    }

def get_self_url():
    env_url = os.environ.get("SELF_URL") or os.environ.get("AWAKE_URL")
    if env_url:
        return env_url
    if os.path.exists(TARGETS_FILE):
        try:
            with open(TARGETS_FILE, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data.get("self_url")
        except:
            pass
    return None

def save_self_url(url):
    try:
        existing = _read_file_raw()
        existing["self_url"] = url
        _write_file_raw(existing)
    except:
        pass

def _read_file_raw():
    if os.path.exists(TARGETS_FILE):
        try:
            with open(TARGETS_FILE, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
                elif isinstance(data, list):
                    return {"self_url": None, "targets": data}
        except:
            pass
    return {"self_url": None, "targets": []}

def _write_file_raw(data):
    tmp = TARGETS_FILE + ".tmp"
    with open(tmp, 'w') as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, TARGETS_FILE)

def load_targets():
    seen_urls = set()
    merged = []

    for b in BUILTIN_TARGETS:
        url = b["url"].strip()
        if url not in seen_urls:
            seen_urls.add(url)
            merged.append(make_target(url, b.get("label", ""), b.get("is_active", True)))

    raw = _read_file_raw()
    file_targets = raw.get("targets", [])
    for t in file_targets:
        url = t.get("url", "").strip()
        if url and url not in seen_urls:
            seen_urls.add(url)
            merged.append({
                "url": url,
                "pings": 0,
                "success": 0,
                "last_ping": None,
                "is_active": t.get("is_active", True),
                "label": t.get("label", "")
            })

    env_targets_raw = os.environ.get("AWAKE_TARGETS", "")
    if env_targets_raw:
        try:
            env_targets = json.loads(env_targets_raw)
            if isinstance(env_targets, list):
                for item in env_targets:
                    if isinstance(item, str):
                        url = item.strip()
                        lbl = ""
                    elif isinstance(item, dict):
                        url = item.get("url", "").strip()
                        lbl = item.get("label", "")
                    else:
                        continue
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        merged.append(make_target(url, lbl))
        except Exception as e:
            print(f"[AWAKE] AWAKE_TARGETS parse error: {e}", flush=True)

    return merged

def save_targets():
    try:
        raw = _read_file_raw()
        raw["targets"] = watchdog_state["targets"]
        _write_file_raw(raw)
    except Exception as e:
        print(f"[AWAKE] Save error: {e}", flush=True)

watchdog_state = {
    "targets": load_targets(),
    "logs": [],
    "pings_received": 0,
    "start_time": time.time(),
    "self_ping_count": 0,
    "self_ping_last": None
}

save_targets()

def add_log(msg):
    timestamp = time.strftime("%H:%M:%S")
    entry = f"[{timestamp}] {msg}"
    watchdog_state["logs"].append(entry)
    if len(watchdog_state["logs"]) > 50:
        watchdog_state["logs"].pop(0)
    print(entry, flush=True)

def do_ping(ping_url, headers, max_retries=3):
    last_error = None
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(ping_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                return True, response.status
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(2 * (attempt + 1))
    return False, last_error

def ping_loop():
    add_log("SYSTEM: Heartbeat Kernel Initialized (standalone mode)")
    last_save_time = time.time()

    while True:
        if watchdog_state["targets"] and time.time() - last_save_time > 30:
            save_targets()
            last_save_time = time.time()

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        self_url = get_self_url()
        if self_url:
            headers["X-Awake-URL"] = self_url

        for target in watchdog_state["targets"]:
            if not target.get("is_active"):
                continue

            target["pings"] += 1
            url = target["url"].strip()

            ping_url = url
            if not ping_url.startswith("http"):
                ping_url = "https://" + ping_url

            if ping_url.count('/') == 2:
                ping_url += "/hook.html"

            ok, result = do_ping(ping_url, headers)

            if ok:
                target["success"] += 1
                if target["pings"] % 30 == 0:
                    add_log(f"PULSE: Stable {target.get('label', 'Link')} -> {url}")
            else:
                if target["pings"] % 10 == 0:
                    add_log(f"FAIL: {url} - {str(result)[:80]}")

            target["last_ping"] = time.strftime("%H:%M:%S")

        time.sleep(1)

def self_ping_loop():
    time.sleep(10)
    add_log("SYSTEM: Internal self-ping engine started (wasmer.io NOT required)")

    while True:
        self_url = get_self_url()
        if self_url:
            try:
                ping_url = self_url.rstrip("/") + "/api/cron-pulse"
                req = urllib.request.Request(
                    ping_url,
                    headers={
                        "User-Agent": "AWAKE-Internal-Watchdog/2.0",
                        "X-Self-Ping": "true"
                    }
                )
                with urllib.request.urlopen(req, timeout=60) as resp:
                    watchdog_state["self_ping_count"] += 1
                    watchdog_state["self_ping_last"] = time.strftime("%H:%M:%S")
                    add_log(f"SYSTEM: Self-ping #{watchdog_state['self_ping_count']} OK")
            except Exception as e:
                add_log(f"SYSTEM: Self-ping skipped: {str(e)[:60]}")
        else:
            add_log("SYSTEM: Heartbeat tick (awaiting self-URL)")

        time.sleep(55)

# Start background watchdog threads
threading.Thread(target=ping_loop, daemon=True, name="AwakePingLoop").start()
threading.Thread(target=self_ping_loop, daemon=True, name="AwakeSelfPingLoop").start()

# ---------- Awake Routes ----------
@app.route("/hook.html")
@app.route("/hook")
@app.route("/api/hook")
def hook_route():
    host = request.headers.get("Host")
    if host and not host.startswith("localhost") and not host.startswith("127.0.0.1"):
        scheme = request.environ.get('wsgi.url_scheme', 'https')
        detected_url = f"{scheme}://{host}"
        try:
            if detected_url != get_self_url():
                save_self_url(detected_url)
        except:
            pass

    watchdog_state["pings_received"] += 1
    if watchdog_state["pings_received"] % 10 == 0:
        add_log(f"INBOUND: Received {watchdog_state['pings_received']} heartbeats")

    # If it's a browser request expecting HTML, render hook.html dashboard
    accept = request.headers.get("Accept", "")
    if "text/html" in accept and not request.headers.get("X-Awake-URL") and not request.headers.get("X-Self-Ping"):
        return render_template("hook.html")

    return {"status": "pulse received", "node": "AWAKE-V2"}

@app.route("/api/status")
def awake_status():
    uptime_sec = int(time.time() - watchdog_state["start_time"])
    h, rem = divmod(uptime_sec, 3600)
    m, s = divmod(rem, 60)
    watchdog_state["uptime"] = f"{h}h {m}m {s}s"
    return watchdog_state

@app.route("/api/cron-pulse")
def awake_cron_pulse():
    def gen():
        add_log("SYSTEM: Cron pulse received. Maintaining active state...")
        for _ in range(50):
            yield " "
            time.sleep(1)
        yield json.dumps({"status": "ok"})
    return Response(gen(), mimetype="application/json")

@app.route("/api/add", methods=["POST"])
def awake_add():
    try:
        data = request.json
        url = data.get('url', '').strip()
        if url and not any(t['url'] == url for t in watchdog_state["targets"]):
            watchdog_state["targets"].append(make_target(
                url,
                data.get('label', ''),
                True
            ))
            add_log(f"SYSTEM: New pulse target deployed: {url}")
            save_targets()
        return {"success": True}
    except Exception as e:
        return str(e), 400

@app.route("/api/remove", methods=["POST"])
def awake_remove():
    try:
        data = request.json
        url = data.get('url', '')
        watchdog_state["targets"] = [t for t in watchdog_state["targets"] if t['url'] != url]
        add_log(f"SYSTEM: Target decommissioned: {url}")
        save_targets()
        return {"success": True}
    except Exception as e:
        return str(e), 400

@app.route("/api/toggle", methods=["POST"])
def awake_toggle():
    try:
        data = request.json
        url = data.get('url', '')
        for t in watchdog_state["targets"]:
            if t['url'] == url:
                t['is_active'] = not t['is_active']
                add_log(f"SYSTEM: {url} -> {'ACTIVE' if t['is_active'] else 'PAUSED'}")
        save_targets()
        return {"success": True}
    except Exception as e:
        return str(e), 400

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


# ---------- Info Pages ----------
@app.route("/donate")
def donate():
    return render_template("donate.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")


# ---------- Socket.IO ----------
@socketio.on("connect")
def connect():
    ColoredLogger.connection("SOCKET CONNECTED")

@socketio.on("join")
def join(data):
    room = data.get("room", "default")
    name = data.get("name", "Guest")
    join_room(room)

    users[request.sid] = {"name": name, "room": room}

    if room not in room_states:
        room_states[room] = {
            "is_playing": False,
            "time": 0.0,
            "video": None,
            "queue": [],
            "last_updated": time.time(),
            "users": []
        }

    if request.sid not in room_states[room]["users"]:
        room_states[room]["users"].append(request.sid)

    sync_data = {
        "is_playing": room_states[room]["is_playing"],
        "time": get_room_time(room),
        "video": room_states[room]["video"],
        "queue": room_states[room]["queue"]
    }

    emit("sync_state", sync_data)
    ColoredLogger.connection(f"User {name} joined room: {room}")
    emit("system", {"msg": f"{name} joined"}, to=room)

    # Announce the current host for the room
    host_sid = room_states[room]["users"][0]
    host_name = users[host_sid]["name"]
    emit("host_change", {"host_id": host_sid, "host_name": host_name}, to=room)

@socketio.on("disconnect")
def disconnect():
    user = users.pop(request.sid, None)
    if user:
        name = user["name"]
        room = user["room"]
        
        if room in room_states and request.sid in room_states[room]["users"]:
            room_states[room]["users"].remove(request.sid)
            
        ColoredLogger.connection(f"User {name} disconnected from room: {room}")
        emit("system", {"msg": f"{name} left"}, to=room)

        # Notify the remaining users about the new host if the host disconnected
        if room in room_states and room_states[room]["users"]:
            host_sid = room_states[room]["users"][0]
            host_name = users[host_sid]["name"]
            emit("host_change", {"host_id": host_sid, "host_name": host_name}, to=room)

@socketio.on("set_name")
def set_name(data):
    ColoredLogger.connection("set_name:", data)
    user = users.get(request.sid)
    if user:
        old_name = user["name"]
        room = user["room"]
        user["name"] = data["name"]
        emit("system", {"msg": f"{old_name} renamed to {data['name']}"}, to=room)
        
        # Refresh host information names
        if room in room_states and room_states[room]["users"]:
            host_sid = room_states[room]["users"][0]
            host_name = users[host_sid]["name"]
            emit("host_change", {"host_id": host_sid, "host_name": host_name}, to=room)

@socketio.on("chat")
def chat(data):
    ColoredLogger.chat("chat:", data)
    user = users.get(request.sid)
    if user:
        name = user["name"]
        room = user["room"]
        emit("chat", {
            "name": name,
            "msg": data["msg"]
        }, to=room)

@socketio.on("play")
def play(data):
    ColoredLogger.play("play")
    user = users.get(request.sid)
    if user:
        room = user["room"]
        room_states[room]["is_playing"] = True
        room_states[room]["time"] = data["time"]
        room_states[room]["last_updated"] = time.time()
        
        sync_data = {
            "is_playing": True,
            "time": data["time"],
            "video": room_states[room]["video"],
            "queue": room_states[room]["queue"],
            "sentAt": data.get("sentAt")
        }
        emit("play", sync_data, to=room, include_self=False)

@socketio.on("pause")
def pause(data):
    ColoredLogger.pause("pause")
    user = users.get(request.sid)
    if user:
        room = user["room"]
        room_states[room]["is_playing"] = False
        room_states[room]["time"] = data["time"]
        room_states[room]["last_updated"] = time.time()
        
        sync_data = {
            "is_playing": False,
            "time": data["time"],
            "video": room_states[room]["video"],
            "queue": room_states[room]["queue"],
            "sentAt": data.get("sentAt")
        }
        emit("pause", sync_data, to=room, include_self=False)

@socketio.on("seek")
def seek(data):
    ColoredLogger.seek("seek:", data)
    user = users.get(request.sid)
    if user:
        room = user["room"]
        room_states[room]["time"] = data["time"]
        room_states[room]["last_updated"] = time.time()
        
        sync_data = {
            "is_playing": room_states[room]["is_playing"],
            "time": data["time"],
            "video": room_states[room]["video"],
            "queue": room_states[room]["queue"],
            "sentAt": data.get("sentAt")
        }
        emit("seek", sync_data, to=room, include_self=False)

@socketio.on("time_update")
def time_update(data):
    user = users.get(request.sid)
    if user:
        room = user["room"]
        # Only accept periodic time updates from the host to avoid sync conflicts
        if room in room_states and room_states[room]["users"] and room_states[room]["users"][0] == request.sid:
            room_states[room]["time"] = data["time"]
            room_states[room]["last_updated"] = time.time()
            emit("time_sync", {"time": data["time"], "sentAt": data.get("sentAt")}, to=room, include_self=False)

@socketio.on("buffering")
def buffering(data):
    user = users.get(request.sid)
    if user:
        room = user["room"]
        is_buffering = data.get("buffering", False)
        if is_buffering:
            # If the room is playing, automatically pause everyone to let them buffer
            if room in room_states and room_states[room]["is_playing"]:
                room_states[room]["is_playing"] = False
                room_states[room]["time"] = get_room_time(room)
                room_states[room]["last_updated"] = time.time()
                
                sync_data = {
                    "is_playing": False,
                    "time": room_states[room]["time"],
                    "video": room_states[room]["video"],
                    "queue": room_states[room]["queue"],
                    "sentAt": time.time() * 1000
                }
                emit("pause", sync_data, to=room, include_self=False)
                emit("system", {"msg": f"{user['name']} is buffering. Pausing room..."}, to=room)
        else:
            emit("system", {"msg": f"{user['name']} finished buffering"}, to=room)

# ---------- Run ----------
if __name__ == "__main__":
    def run_websocket_relay():
        try:
            import asyncio
            import server
            # Run the server's main loop inside this thread's event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(server.main())
        except Exception as e:
            # Silence port conflicts if already running via run_all.py or other process
            pass

    threading.Thread(target=run_websocket_relay, daemon=True, name="WebsocketRelay").start()

    port = int(os.environ.get("PORT", 8080))
    socketio.run(app, host="0.0.0.0", port=port, allow_unsafe_werkzeug=True)
