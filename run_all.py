import subprocess
import sys
import os
import time
import shutil

def run():
    print("[LiveDRIVE] Starting systems...", flush=True)
    
    # 1. Check and start Caddy reverse proxy if available
    caddy_process = None
    port = os.environ.get("PORT", "8080")
    
    if shutil.which("caddy") and os.path.exists("Caddyfile"):
        print(f"[LiveDRIVE] Caddy reverse proxy detected. Running on port {port}...", flush=True)
        caddy_process = subprocess.Popen(
            ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"],
            stdout=sys.stdout,
            stderr=sys.stderr
        )
    
    # 2. Start server.py (WebSocket relay server on port 8765)
    print("[LiveDRIVE] Starting WebSocket relay server (server.py) on port 8765...", flush=True)
    server_process = subprocess.Popen(
        [sys.executable, "server.py"],
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    # 3. Start main.py (Flask Socket.IO + HTTP server)
    main_env = os.environ.copy()
    if caddy_process:
        # Flask runs on 8080 internally, Caddy proxies to it
        main_env["PORT"] = "8080"
        print("[LiveDRIVE] Starting HTTP/Socket.IO server (main.py) on internal port 8080...", flush=True)
    else:
        # No proxy, Flask runs directly on the exposed PORT
        print(f"[LiveDRIVE] Starting HTTP/Socket.IO server (main.py) directly on port {port}...", flush=True)

    main_process = subprocess.Popen(
        [sys.executable, "main.py"],
        env=main_env,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    # Monitor processes
    try:
        while True:
            # If server.py stopped
            if server_process.poll() is not None:
                print("[LiveDRIVE] server.py terminated. Exiting...", flush=True)
                main_process.terminate()
                if caddy_process:
                    caddy_process.terminate()
                sys.exit(1)
                
            # If main.py stopped
            if main_process.poll() is not None:
                print("[LiveDRIVE] main.py terminated. Exiting...", flush=True)
                server_process.terminate()
                if caddy_process:
                    caddy_process.terminate()
                sys.exit(1)
                
            # If Caddy stopped
            if caddy_process and caddy_process.poll() is not None:
                print("[LiveDRIVE] Caddy terminated. Exiting...", flush=True)
                server_process.terminate()
                main_process.terminate()
                sys.exit(1)
                
            time.sleep(1)
    except KeyboardInterrupt:
        print("[LiveDRIVE] Shutting down all systems...", flush=True)
        server_process.terminate()
        main_process.terminate()
        if caddy_process:
            caddy_process.terminate()

if __name__ == "__main__":
    run()
