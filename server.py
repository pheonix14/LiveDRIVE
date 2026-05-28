import asyncio
import logging
import sys
import json
import time
import websockets

# Reconfigure stdout/stderr encoding to UTF-8 on Windows to print unicode blocks without error
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add custom SYNC log level
SYNC_LEVEL_NUM = 25
logging.addLevelName(SYNC_LEVEL_NUM, "SYNC")

def log_sync(self, message, *args, **kws):
    if self.isEnabledFor(SYNC_LEVEL_NUM):
        self._log(SYNC_LEVEL_NUM, message, args, **kws)
logging.Logger.sync = log_sync

class CustomFormatter(logging.Formatter):
    COLORS = {
        logging.DEBUG: "\033[37m",       # Dim white / light gray
        logging.INFO: "\033[36m",        # Cyan
        SYNC_LEVEL_NUM: "\033[35m",      # Purple / Magenta
        logging.WARNING: "\033[33m",     # Yellow
        logging.ERROR: "\033[1;31m",     # Bold Red
    }

    def format(self, record):
        # Format timestamp in dim gray (ansi 90m)
        timestamp = f"\033[90m{self.formatTime(record, '%H:%M:%S')}\033[0m"
        
        # Right pad level name to 7 chars
        level_name = record.levelname.ljust(7)
        color = self.COLORS.get(record.levelno, "")
        reset = "\033[0m" if color else ""
        
        return f"{timestamp}  {color}{level_name}{reset} {record.getMessage()}"

# Set up logging
logger = logging.getLogger("livedrive")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(CustomFormatter())
logger.addHandler(handler)

# Keep track of active rooms and their peers
# rooms = {
#     room_name: {
#         "sockets": set(),
#         "last_activity": float,
#         "lifetime": int,
#         "self_destruct": bool
#     }
# }
rooms = {}

def parse_lifetime(val):
    if val is None:
        return 60
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        val_lower = val.lower().strip()
        try:
            return int(val_lower)
        except ValueError:
            pass
        
        import re
        match = re.match(r'^(\d+)\s*(hour|hr|day|d|min|m)', val_lower)
        if match:
            num = int(match.group(1))
            unit = match.group(2)
            if unit.startswith('d'):
                return num * 24 * 60
            elif unit.startswith('h'):
                return num * 60
            elif unit.startswith('m'):
                return num
        return 60
    return 60

def format_inactive_time(seconds):
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}m {secs}s"

async def register(websocket, room_name):
    if room_name not in rooms:
        rooms[room_name] = {
            "sockets": set(),
            "last_activity": time.time(),
            "lifetime": 60, # default 1 hour
            "self_destruct": False
        }
    rooms[room_name]["sockets"].add(websocket)
    
    # Log client connection
    ip = websocket.remote_address[0]
    logger.info(f"Client connected       → {ip}  [room: {room_name.upper()}]")

async def unregister(websocket, room_name):
    if room_name in rooms:
        rooms[room_name]["sockets"].discard(websocket)
        if not rooms[room_name]["sockets"]:
            del rooms[room_name]
            
    # Log client disconnection
    ip = websocket.remote_address[0]
    logger.info(f"Client disconnected    → {ip}  [room: {room_name.upper()}]")

async def cleanup_rooms_loop():
    while True:
        await asyncio.sleep(60)
        now = time.time()
        expired_rooms = []
        
        for room_name in list(rooms.keys()):
            room = rooms[room_name]
            lifetime = room["lifetime"]
            if lifetime <= 0:
                continue
                
            threshold_seconds = lifetime * 60
            elapsed = now - room["last_activity"]
            remaining = threshold_seconds - elapsed
            
            if elapsed >= threshold_seconds:
                expired_rooms.append(room_name)
            elif remaining <= 120:  # within 2 minutes of expiry
                inactive_str = format_inactive_time(elapsed)
                logger.warning(f"Room {room_name.upper()}  inactive {inactive_str}      → expiry imminent")
                
        for room_name in expired_rooms:
            room = rooms.get(room_name)
            if not room:
                continue
                
            lifetime_str = f"{room['lifetime']}m" if room['lifetime'] < 60 else f"{room['lifetime']//60}h"
            logger.info(f"Room {room_name.upper()}  purged                → exceeded {lifetime_str} lifetime")
            
            expired_msg = json.dumps({"type": "room_expired"})
            sockets = list(room["sockets"])
            
            if sockets:
                await asyncio.gather(
                    *[ws.send(expired_msg) for ws in sockets],
                    return_exceptions=True
                )
                await asyncio.gather(
                    *[ws.close() for ws in sockets],
                    return_exceptions=True
                )
                
            if room_name in rooms:
                del rooms[room_name]

async def handler_loop(*args, **kwargs):
    if len(args) == 2:
        websocket, path = args
    elif len(args) == 1:
        websocket = args[0]
        # Modern websockets version uses connection object, path is in websocket.request.path
        path = getattr(websocket, "path", None)
        if path is None:
            request_obj = getattr(websocket, "request", None)
            if request_obj is not None:
                path = getattr(request_obj, "path", None)
        if path is None:
            path = "default"
    else:
        raise TypeError("Unexpected number of arguments in websocket handler")

    # Isolate room name from URI path
    # e.g., path is "/oppenheimer" or "/oppenheimer/"
    room_name = path.strip("/").lower() if path else "default"
    if not room_name:
        room_name = "default"
        
    await register(websocket, room_name)
    try:
        async for message in websocket:
            if room_name in rooms:
                rooms[room_name]["last_activity"] = time.time()

            try:
                data = json.loads(message)
                action = data.get("action") or data.get("type")
                sender_name = data.get("senderName") or data.get("name") or "Anonymous"
                
                # Check for room config updates from host
                if room_name in rooms:
                    if "roomLifetime" in data:
                        rooms[room_name]["lifetime"] = parse_lifetime(data["roomLifetime"])
                    if "roomSelfDestruct" in data:
                        rooms[room_name]["self_destruct"] = bool(data["roomSelfDestruct"])

                # Check for sync action to log
                if action in ["play", "pause", "seek", "chat", "system_join", "reaction", "playlist_update", "playlist_skip"]:
                    peers_count = len(rooms[room_name]["sockets"])
                    logger.info(f"Room {room_name.upper()}  activity updated      → {peers_count} peers active")
                elif action == "trigger_destruct":
                    logger.error(f"Self-destruct     triggered early       → host detonated {room_name.upper()}")
                elif action == "config_update":
                    pass
                elif action in ["sync_state"]:
                    peers_count = len(rooms.get(room_name, {}).get("sockets", []))
                    logger.log(SYNC_LEVEL_NUM, f"Broadcast sync event   → room {room_name.upper()}  ({peers_count} peers)")
                elif action == "request_pause":
                    logger.warning(f"Client timeout         → {sender_name}  [2G detected]")
                elif action == "request_resume":
                    logger.info(f"Client resume          → {sender_name}  [ready]")
            except Exception:
                # If message is not valid JSON, we just treat it as debug
                logger.debug(f"Raw message received: {message[:100]}")
                
            # Broadcast to everyone else in the room
            if room_name in rooms:
                targets = [peer for peer in rooms[room_name]["sockets"] if peer != websocket]
                if targets:
                    await asyncio.gather(
                        *[peer.send(message) for peer in targets],
                        return_exceptions=True
                    )
    except websockets.exceptions.ConnectionClosedOK:
        pass
    except websockets.exceptions.ConnectionClosedError:
        pass
    except Exception as e:
        logger.error(f"Handler error: {e}")
    finally:
        await unregister(websocket, room_name)

def print_banner():
    banner = """
┌──────────────────────────────────────────────────────────┐
│  ██╗     ██╗██╗   ██╗███████╗██████╗ ██████╗ ██╗██╗   ██╗│
│  ██║     ██║██║   ██║██╔════╝██╔══██╗██╔══██╗██║██║   ██║│
│  ██║     ██║██║   ██║█████╗  ██║  ██║██████╔╝██║██║   ██║│
│  ██║     ██║╚██╗ ██╔╝██╔══╝  ██║  ██║██╔══██╗██║╚██╗ ██╔╝│
│  ███████╗██║ ╚████╔╝ ███████╗██████╔╝██║  ██║██║ ╚████╔╝ │
│  ╚══════╝╚═╝  ╚═══╝  ╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝  │
└──────────────────────────────────────────────────────────┘
"""
    print(banner)
    print("────────────────────────────────────────────────────────")
    print(" LIVEDRIVE RELAY  v1.0  |  ws://0.0.0.0:8765")
    print("────────────────────────────────────────────────────────")

async def main():
    print_banner()
    # Start cleanup background task
    asyncio.create_task(cleanup_rooms_loop())
    
    # Start websockets server on port 8765
    try:
        async with websockets.serve(handler_loop, "0.0.0.0", 8765):
            await asyncio.Future()  # run forever
    except KeyboardInterrupt:
        logger.info("Relay server stopped by user")
    except Exception as e:
        logger.error(f"Relay connection lost  → retrying in 5s: {e}")
        await asyncio.sleep(5)
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nGoodbye.")
