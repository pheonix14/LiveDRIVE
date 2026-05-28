import subprocess
import time
import sys
import os
import socketio

class MockClient:
    def __init__(self, name, room):
        self.name = name
        self.room = room
        self.sio = socketio.Client()
        self.events = []

        @self.sio.on('sync_state')
        def on_sync(data):
            self.events.append(('sync_state', data))

        @self.sio.on('play')
        def on_play(data):
            self.events.append(('play', data))

        @self.sio.on('pause')
        def on_pause(data):
            self.events.append(('pause', data))

        @self.sio.on('seek')
        def on_seek(data):
            self.events.append(('seek', data))

        @self.sio.on('chat')
        def on_chat(data):
            self.events.append(('chat', data))

        @self.sio.on('system')
        def on_system(data):
            self.events.append(('system', data))

        @self.sio.on('host_change')
        def on_host(data):
            self.events.append(('host_change', data))

        @self.sio.on('time_sync')
        def on_time_sync(data):
            self.events.append(('time_sync', data))

    def connect(self, url):
        self.sio.connect(url, transports=['polling'])
        self.sio.emit('join', {'name': self.name, 'room': self.room})

    def emit(self, event, data):
        self.sio.emit(event, data)

    def disconnect(self):
        if self.sio.connected:
            self.sio.disconnect()

    def get_event(self, name, timeout=3.0):
        start = time.time()
        while time.time() - start < timeout:
            for ev in self.events:
                if ev[0] == name:
                    self.events.remove(ev)
                    return ev[1]
            time.sleep(0.1)
        return None

def run_tests():
    print("Starting LiveDRIVE server process...")
    # Find Python executable in the virtual environment
    python_exe = os.path.join(".venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    # Start main.py on port 8888 to avoid port conflicts
    env = os.environ.copy()
    env["PORT"] = "8888"
    
    server_proc = subprocess.Popen(
        [python_exe, "main.py"],
        env=env,
        text=True
    )
    
    # Wait for server startup
    time.sleep(3)
    server_url = "http://127.0.0.1:8888"

    client1 = MockClient(name="Alice", room="testroom")
    client2 = MockClient(name="Bob", room="testroom")
    client3 = MockClient(name="Charlie", room="otherroom")

    try:
        print("Connecting client 1 (Alice) to testroom...")
        client1.connect(server_url)
        time.sleep(0.5)

        # Check initial sync event on join
        sync_evt = client1.get_event('sync_state')
        assert sync_evt is not None, "Alice did not receive sync_state event"
        print("Alice successfully synced state. Pre-loaded video:", sync_evt.get("video"))
        assert sync_evt.get("video") == "testroom_q1_mgr.mp4", "Initial pre-loaded video is incorrect"

        # Consume Alice's own join system message and host change
        alice_join = client1.get_event('system')
        assert alice_join is not None, "Alice did not receive her own join event"
        assert "Alice joined" in alice_join.get("msg")
        print("Alice consumed her own join notification.")

        alice_host = client1.get_event('host_change')
        assert alice_host is not None, "Alice did not receive host change event"
        assert alice_host.get("host_name") == "Alice"
        print("Alice successfully recognized as host of testroom.")

        print("Connecting client 2 (Bob) to testroom...")
        client2.connect(server_url)
        time.sleep(0.5)

        # Bob joins testroom
        bob_sync = client2.get_event('sync_state')
        assert bob_sync is not None, "Bob did not receive sync_state event"
        print("Bob successfully synced state.")

        # Bob should receive host change setting Alice as host
        bob_host = client2.get_event('host_change')
        assert bob_host is not None, "Bob did not receive host change event"
        assert bob_host.get("host_name") == "Alice"
        print("Bob successfully recognized Alice as the host.")

        # Alice should get a system event that Bob joined
        sys_evt = client1.get_event('system')
        assert sys_evt is not None, "Alice did not get notification that Bob joined"
        assert "Bob joined" in sys_evt.get("msg")
        
        # Alice also gets a refreshed host_change event when Bob joins
        client1.get_event('host_change')
        print("Alice received Bob join notification successfully.")

        print("Connecting client 3 (Charlie) to otherroom (isolation check)...")
        client3.connect(server_url)
        time.sleep(0.5)

        charlie_sync = client3.get_event('sync_state')
        assert charlie_sync is not None, "Charlie did not receive sync_state event"
        assert charlie_sync.get("video") is None, "Charlie got testroom's video details instead of an empty room state"
        
        charlie_host = client3.get_event('host_change')
        assert charlie_host is not None, "Charlie did not receive host change event"
        assert charlie_host.get("host_name") == "Charlie"
        print("Charlie connected to otherroom, isolated, and became host of otherroom successfully.")

        # Test Case: Play Synchronization
        print("Testing play synchronization...")
        client1.emit('play', {'time': 12.5, 'sentAt': int(time.time() * 1000)})
        
        # Bob should receive play event
        play_evt = client2.get_event('play')
        assert play_evt is not None, "Bob did not receive play event from Alice"
        assert play_evt.get('time') == 12.5, f"Bob got wrong time: {play_evt.get('time')}"
        assert play_evt.get('sentAt') is not None, "Bob did not receive sentAt timestamp"
        
        # Charlie should NOT receive play event
        play_evt_isolated = client3.get_event('play', timeout=1.0)
        assert play_evt_isolated is None, "Charlie incorrectly received Alice's play event (Isolation Failure!)"
        print("Play synchronization and isolation test passed.")

        # Test Case: Pause Synchronization
        print("Testing pause synchronization...")
        client1.emit('pause', {'time': 15.0, 'sentAt': int(time.time() * 1000)})
        
        # Bob should receive pause event
        pause_evt = client2.get_event('pause')
        assert pause_evt is not None, "Bob did not receive pause event from Alice"
        assert pause_evt.get('time') == 15.0, f"Bob got wrong time: {pause_evt.get('time')}"
        
        # Charlie should NOT receive pause event
        pause_evt_isolated = client3.get_event('pause', timeout=1.0)
        assert pause_evt_isolated is None, "Charlie incorrectly received Alice's pause event (Isolation Failure!)"
        print("Pause synchronization and isolation test passed.")

        # Test Case: Seek Synchronization
        print("Testing seek synchronization...")
        client1.emit('seek', {'time': 45.0, 'sentAt': int(time.time() * 1000)})
        
        # Bob should receive seek event
        seek_evt = client2.get_event('seek')
        assert seek_evt is not None, "Bob did not receive seek event from Alice"
        assert seek_evt.get('time') == 45.0, f"Bob got wrong time: {seek_evt.get('time')}"
        print("Seek synchronization test passed.")

        # Test Case: Periodic Host Sync (time_update -> time_sync)
        print("Testing periodic host sync...")
        client1.emit('time_update', {'time': 120.5, 'sentAt': int(time.time() * 1000)})
        
        # Bob should receive time_sync
        ts_evt = client2.get_event('time_sync')
        assert ts_evt is not None, "Bob did not receive time_sync event from host Alice"
        assert ts_evt.get('time') == 120.5, f"Bob got wrong time: {ts_evt.get('time')}"
        assert ts_evt.get('sentAt') is not None, "Bob did not receive sentAt in time_sync"
        
        # Charlie should NOT receive time_sync
        ts_evt_isolated = client3.get_event('time_sync', timeout=1.0)
        assert ts_evt_isolated is None, "Charlie incorrectly received Alice's time_sync (Isolation Failure!)"
        print("Periodic host sync and isolation test passed.")

        # Test Case: Buffering Sync
        print("Testing buffering sync...")
        # Make the room state playing first
        client1.emit('play', {'time': 100.0, 'sentAt': int(time.time() * 1000)})
        client2.get_event('play')  # Consume play event for Bob
        client1.get_event('host_change')  # Consume host changes if any
        
        # Bob starts buffering
        client2.emit('buffering', {'buffering': True})
        
        # Alice should get a pause event because Bob buffered
        alice_pause = client1.get_event('pause')
        assert alice_pause is not None, "Alice did not get pause event when Bob buffered"
        
        # Alice should also get a system notification message that Bob is buffering
        sys_buf = client1.get_event('system')
        assert sys_buf is not None, "Alice did not get buffering notification message"
        assert "Bob is buffering" in sys_buf.get("msg")
        print("Buffering synchronization test passed.")

        # Test Case: Chat Isolation
        print("Testing chat isolation...")
        client1.emit('chat', {'msg': 'Hello room!'})
        
        # Bob should receive chat message
        chat_evt = client2.get_event('chat')
        assert chat_evt is not None, "Bob did not receive Alice's chat message"
        assert chat_evt.get('msg') == 'Hello room!', f"Wrong chat message: {chat_evt.get('msg')}"
        
        # Charlie should NOT receive chat message
        chat_evt_isolated = client3.get_event('chat', timeout=1.0)
        assert chat_evt_isolated is None, "Charlie incorrectly received Alice's chat message (Isolation Failure!)"
        print("Chat synchronization and isolation test passed.")

        print("All integration tests completed successfully!")

    finally:
        client1.disconnect()
        client2.disconnect()
        client3.disconnect()
        print("Cleaning up server process...")
        server_proc.terminate()
        try:
            server_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_proc.kill()
        print("Server shutdown completed.")

if __name__ == "__main__":
    run_tests()
