#!/usr/bin/env python3
"""
LiveDRIVE Unified CLI Launcher
Commands:
  livedrive / ld      - Start all services (Backend + Next.js UI)
  ldui                - Start Next.js UI dev server
  ldcli               - Start Backend servers (WebSocket relay + Flask)
  livedrive --build   - Build static export for GitHub Pages
"""

import sys
import os
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def print_banner():
    banner = r"""
    ======================================================
       __    _            ____  ____  _____ _    __ _____
      / /   (_)   _____  / __ \/ __ \/  _/ | / /____ /
     / /   / / | / / _ \/ / / / /_/ // / | | / / __/ / 
    / /___/ /| |/ /  __/ /_/ / _, _// /  | |/ / /___/  
   /_____/_/ |___/\___/_____/_/ |_/___/  |___/_____/   
    ======================================================
               WATCH TOGETHER CINEMA SYSTEM
    """
    print(banner, flush=True)

def run_backend():
    print("[LiveDRIVE] Starting Backend Servers...", flush=True)
    server_py = os.path.join(ROOT_DIR, "server.py")
    main_py = os.path.join(ROOT_DIR, "main.py")

    processes = []
    # 1. Start WebSocket relay on port 8765
    print("[LiveDRIVE] -> WebSocket relay starting on ws://localhost:8765", flush=True)
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"[LiveDRIVE] -> LAN / Phone connection URL: ws://{local_ip}:8765", flush=True)
    except Exception:
        pass
    p_ws = subprocess.Popen([sys.executable, server_py], cwd=ROOT_DIR)
    processes.append(p_ws)

    # 2. Start Flask Socket.IO on port 8080
    env = os.environ.copy()
    env.setdefault("PORT", "8080")
    print(f"[LiveDRIVE] -> Flask Server starting on http://localhost:{env['PORT']}", flush=True)
    p_main = subprocess.Popen([sys.executable, main_py], env=env, cwd=ROOT_DIR)
    processes.append(p_main)

    return processes

def run_ui():
    print("[LiveDRIVE] Starting Next.js UI Server (http://localhost:3000)...", flush=True)
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    p_ui = subprocess.Popen([npm_cmd, "run", "dev"], cwd=FRONTEND_DIR)
    return p_ui

def build_ui():
    print("[LiveDRIVE] Building Next.js static export for GitHub Pages...", flush=True)
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    ret = subprocess.call([npm_cmd, "run", "build"], cwd=FRONTEND_DIR)
    if ret == 0:
        print("\n[LiveDRIVE] Build successful! Static files ready in frontend/out/", flush=True)
    else:
        print(f"\n[LiveDRIVE] Build failed with exit code {ret}", flush=True)
    return ret

def monitor_processes(processes):
    try:
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"[LiveDRIVE] Process PID {p.pid} exited with code {p.returncode}.", flush=True)
                    terminate_all(processes)
                    return
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[LiveDRIVE] Stopping all services...", flush=True)
        terminate_all(processes)

def terminate_all(processes):
    for p in processes:
        if p and p.poll() is None:
            try:
                p.terminate()
            except Exception:
                pass
    time.sleep(0.5)
    for p in processes:
        if p and p.poll() is None:
            try:
                p.kill()
            except Exception:
                pass

def interactive_menu():
    print_banner()
    print(" Choose an option:")
    print("  [1] Start All (Backend Relay + Flask + Next.js UI)")
    print("  [2] Start Next.js UI only (ldui)")
    print("  [3] Start Backend Servers only (ldcli)")
    print("  [4] Build Next.js UI for GitHub Pages")
    print("  [5] Exit")
    print("-" * 54)
    choice = input("Enter choice [1-5] (default: 1): ").strip()
    if not choice:
        choice = "1"

    if choice == "1":
        procs = run_backend()
        procs.append(run_ui())
        monitor_processes(procs)
    elif choice == "2":
        proc = run_ui()
        monitor_processes([proc])
    elif choice == "3":
        procs = run_backend()
        monitor_processes(procs)
    elif choice == "4":
        build_ui()
    elif choice == "5":
        print("Exiting.")
        sys.exit(0)
    else:
        print("Invalid choice.")
        sys.exit(1)

def main():
    args = sys.argv[1:]
    if "--ui" in args or "ui" in args:
        proc = run_ui()
        monitor_processes([proc])
    elif "--cli" in args or "cli" in args or "--backend" in args:
        procs = run_backend()
        monitor_processes(procs)
    elif "--build" in args or "build" in args:
        code = build_ui()
        sys.exit(code)
    elif "--all" in args or "all" in args:
        procs = run_backend()
        procs.append(run_ui())
        monitor_processes(procs)
    else:
        interactive_menu()

if __name__ == "__main__":
    main()
