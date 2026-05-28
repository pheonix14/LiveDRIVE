import asyncio
import json
import websockets

async def test_relay():
    uri = "ws://localhost:8765/testroom"
    print("Connecting client 1...")
    async with websockets.connect(uri) as ws1:
        print("Connecting client 2...")
        async with websockets.connect(uri) as ws2:
            # 1. Test Join message relay
            join_msg = {
                "action": "system_join",
                "name": "TestClient1",
                "senderId": "client1_id",
                "timestamp": 12345
            }
            print("Client 1 sending join...")
            await ws1.send(json.dumps(join_msg))
            
            print("Waiting for Client 2 to receive join...")
            response = await asyncio.wait_for(ws2.recv(), timeout=2.0)
            data = json.loads(response)
            print("Received on Client 2:", data)
            assert data["name"] == "TestClient1"
            assert data["action"] == "system_join"
            print("Join event relayed successfully!")

            # 2. Test configuration updates (lifetime and self-destruct)
            config_msg = {
                "action": "config_update",
                "type": "config_update",
                "roomLifetime": 15,
                "roomSelfDestruct": True,
                "senderId": "client1_id"
            }
            print("Client 1 sending config update...")
            await ws1.send(json.dumps(config_msg))

            print("Waiting for Client 2 to receive config update...")
            response = await asyncio.wait_for(ws2.recv(), timeout=2.0)
            data = json.loads(response)
            print("Received on Client 2:", data)
            assert data["roomLifetime"] == 15
            assert data["roomSelfDestruct"] is True
            print("Config updates parsed and relayed successfully!")

            # 2b. Test configuration updates with string lifetime
            config_msg_str = {
                "action": "config_update",
                "type": "config_update",
                "roomLifetime": "3hours",
                "roomSelfDestruct": False,
                "senderId": "client1_id"
            }
            print("Client 1 sending config update with string lifetime...")
            await ws1.send(json.dumps(config_msg_str))

            print("Waiting for Client 2 to receive config update with string lifetime...")
            response = await asyncio.wait_for(ws2.recv(), timeout=2.0)
            data = json.loads(response)
            print("Received on Client 2:", data)
            assert data["roomLifetime"] == "3hours"
            print("Config update with string lifetime parsed and relayed successfully!")

            # 3. Test Detonate early detonation trigger
            detonation_msg = {
                "action": "trigger_destruct",
                "type": "trigger_destruct",
                "destructTime": 123456789,
                "senderId": "client1_id"
            }
            print("Client 1 sending detonate...")
            await ws1.send(json.dumps(detonation_msg))

            print("Waiting for Client 2 to receive detonate...")
            response = await asyncio.wait_for(ws2.recv(), timeout=2.0)
            data = json.loads(response)
            print("Received on Client 2:", data)
            assert data["action"] == "trigger_destruct"
            assert data["destructTime"] == 123456789
            print("Detonation event relayed successfully!")

if __name__ == "__main__":
    try:
        asyncio.run(test_relay())
        print("\nAll relay tests passed successfully!")
    except Exception as e:
        print("\nTest failed:", e)
        exit(1)
