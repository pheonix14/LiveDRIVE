import asyncio
import subprocess
import sys
import os
import time
from playwright.async_api import async_playwright

async def run_6_users_test():
    print("==================================================", flush=True)
    print(" STARTING 6-USER PLAYWRIGHT SYNCHRONIZATION TEST  ", flush=True)
    print("==================================================", flush=True)

    # Find Python executable
    python_exe = sys.executable

    # 1. Start server.py (WebSocket relay) on port 8765
    print("[TEST] Starting server.py...", flush=True)
    server_env = os.environ.copy()
    server_proc = subprocess.Popen(
        [python_exe, "server.py"],
        env=server_env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # 2. Start main.py (Flask App) on port 8888
    print("[TEST] Starting main.py on port 8888...", flush=True)
    main_env = os.environ.copy()
    main_env["PORT"] = "8888"
    main_proc = subprocess.Popen(
        [python_exe, "main.py"],
        env=main_env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # Wait for servers to spin up
    await asyncio.sleep(4)
    server_url = "http://localhost:8888/?room=SYNCROOM-1234"

    print("[TEST] Launching Playwright browser...", flush=True)
    async with async_playwright() as p:
        # Launch headless browser
        browser = await p.chromium.launch(headless=True)
        
        # Create 6 isolated contexts
        contexts = []
        pages = []
        
        print("[TEST] Initializing 6 user browser sessions...", flush=True)
        for i in range(6):
            context = await browser.new_context()
            page = await context.new_page()
            
            # Setup console log and error handlers
            def make_console_handler(idx):
                def print_console(msg):
                    try:
                        print(f"  [USER {idx} CONSOLE]: {msg.text}", flush=True)
                    except UnicodeEncodeError:
                        safe_text = msg.text.encode('ascii', errors='replace').decode('ascii')
                        print(f"  [USER {idx} CONSOLE]: {safe_text}", flush=True)
                return print_console
            def make_error_handler(idx):
                def print_error(err):
                    try:
                        print(f"  [USER {idx} ERROR]: {err}", flush=True)
                    except UnicodeEncodeError:
                        safe_err = str(err).encode('ascii', errors='replace').decode('ascii')
                        print(f"  [USER {idx} ERROR]: {safe_err}", flush=True)
                return print_error
                
            page.on("console", make_console_handler(i+1))
            page.on("pageerror", make_error_handler(i+1))
            
            contexts.append(context)
            pages.append(page)
            
            # Navigate to the room
            await page.goto(server_url)
            print(f"  - User {i+1} navigated to room", flush=True)
            # Wait for identity to load and joinRoom function to be available
            await page.wait_for_function("() => typeof myUsername !== 'undefined' && typeof joinRoom !== 'undefined'")
            await page.evaluate("() => { nameInput.value = myUsername; roomInput.value = 'SYNCROOM-1234'; joinRoom(); }")
            print(f"  - User {i+1} joined room programmatically", flush=True)

        # Wait for page loads and network idle
        await asyncio.sleep(4)

        print("[TEST] Verifying all users joined theater room...", flush=True)
        for i, page in enumerate(pages):
            # Check window properties to see if script has loaded
            state_exists = await page.evaluate("() => typeof joined !== 'undefined'")
            print(f"  - User {i+1} scope initialized: {state_exists}", flush=True)
            
            joined = await page.evaluate("() => typeof joined !== 'undefined' ? joined : false")
            room = await page.evaluate("() => typeof currentRoom !== 'undefined' ? currentRoom : 'unknown'")
            username = await page.evaluate("() => typeof myUsername !== 'undefined' ? myUsername : 'anonymous'")
            print(f"  - User {i+1} ({username}) joined room '{room}': {joined}", flush=True)
            assert joined is True, f"User {i+1} failed to join room"

        # 3. Test Chat synchronization
        print("\n[TEST] Testing Chat Sync across all 6 users...", flush=True)
        chat_input_selector = "#msg"
        chat_send_selector = "button[onclick='sendMsg()']"
        
        test_message = "Hello from User 1! Sync check."
        
        # User 1 types and sends message
        await pages[0].fill(chat_input_selector, test_message)
        await pages[0].click(chat_send_selector)
        print(f"  - User 1 sent message: '{test_message}'", flush=True)
        
        # Wait for message to propagate
        await asyncio.sleep(2)
        
        # Verify message is visible in chat history on all other 5 pages
        for i in range(1, 6):
            chat_box = pages[i].locator("#chat")
            chat_text = await chat_box.inner_text()
            print(f"  - User {i+1} chat box contains message: {test_message in chat_text}", flush=True)
            assert test_message in chat_text, f"User {i+1} did not receive chat message"

        # 4. Test Video Playback state synchronization
        print("\n[TEST] Testing Playback Sync...", flush=True)
        for i, page in enumerate(pages):
            is_playing = await page.evaluate("() => typeof roomIsPlaying !== 'undefined' ? roomIsPlaying : false")
            assert is_playing is False, f"User {i+1} was playing initially"

        # Trigger programmatical Play from User 1 (the host)
        print("  - User 1 triggering play...", flush=True)
        await pages[0].evaluate("() => { if(typeof playerControl !== 'undefined' && playerControl) playerControl.play(); }")
        
        # Wait for synchronization to propagate
        await asyncio.sleep(3)
        
        # Assert all users synchronized state to playing
        for i, page in enumerate(pages):
            is_playing = await page.evaluate("() => typeof roomIsPlaying !== 'undefined' ? roomIsPlaying : false")
            print(f"  - User {i+1} is_playing: {is_playing}", flush=True)
            assert is_playing is True, f"User {i+1} failed to synchronize play state"

        # 5. Test Seek synchronization
        print("\n[TEST] Testing Seek Sync...", flush=True)
        seek_pos = 120.0
        print(f"  - User 1 seeking to position {seek_pos}s...", flush=True)
        await pages[0].evaluate(f"() => {{ if(typeof playerControl !== 'undefined' && playerControl) playerControl.seek({seek_pos}); }}")
        
        # Wait for synchronization to propagate
        await asyncio.sleep(3)
        
        # Assert all users synchronized playback position close to seek_pos
        for i, page in enumerate(pages):
            pos = await page.evaluate("() => typeof roomPlaybackTime !== 'undefined' ? roomPlaybackTime : 0")
            diff = abs(pos - seek_pos)
            print(f"  - User {i+1} playback position: {pos:.2f}s (delta: {diff:.2f}s)", flush=True)
            assert diff < 3.5, f"User {i+1} out of sync by {diff:.2f}s"

        # 6. Test Pause synchronization
        print("\n[TEST] Testing Pause Sync...", flush=True)
        print("  - User 1 triggering pause...", flush=True)
        await pages[0].evaluate("() => { if(typeof playerControl !== 'undefined' && playerControl) playerControl.pause(); }")
        
        # Wait for synchronization to propagate
        await asyncio.sleep(3)
        
        # Assert all users synchronized state to paused
        for i, page in enumerate(pages):
            is_playing = await page.evaluate("() => typeof roomIsPlaying !== 'undefined' ? roomIsPlaying : false")
            print(f"  - User {i+1} is_playing: {is_playing}", flush=True)
            assert is_playing is False, f"User {i+1} failed to synchronize pause state"

        # Clean up browser contexts
        print("\n[TEST] Closing browser sessions...", flush=True)
        await browser.close()

    print("[TEST] Shutting down servers...", flush=True)
    server_proc.terminate()
    main_proc.terminate()
    print("==================================================", flush=True)
    print(" ALL 6-USER PLAYWRIGHT TESTS PASSED SUCCESSFULLY! ", flush=True)
    print("==================================================", flush=True)

if __name__ == "__main__":
    try:
        asyncio.run(run_6_users_test())
    except Exception as e:
        print("\n[TEST FAILED]:", e, flush=True)
        sys.exit(1)
