const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Rooms store: roomId -> { code, peers: Map<peerId, { ws, userId, username }>, created: Date }
const rooms = new Map();

// Helper to generate 6-digit invite code
function generateRoomCode() {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms.has(code));
    return code;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        activeRooms: rooms.size,
        timestamp: Date.now()
    });
});

// API endpoint to create a room
app.post('/api/rooms/create', (req, res) => {
    const code = generateRoomCode();
    rooms.set(code, {
        code,
        peers: new Map(),
        created: new Date()
    });
    console.log(`[Room Created] Code: ${code}`);
    res.json({ success: true, roomCode: code });
});

// API endpoint to check room status
app.get('/api/rooms/:code', (req, res) => {
    const { code } = req.params;
    const room = rooms.get(code);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({
        success: true,
        roomCode: code,
        peerCount: room.peers.size,
        isFull: room.peers.size >= 2
    });
});

wss.on('connection', (ws, req) => {
    let currentRoomCode = null;
    let currentPeerId = null;

    console.log('[WebSocket] New connection established');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { type, roomCode, peerId, payload } = data;

            switch (type) {
                case 'JOIN_ROOM': {
                    const room = rooms.get(roomCode);
                    if (!room) {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid Room Code' }));
                        return;
                    }
                    if (room.peers.size >= 2) {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full! Couple mode supports max 2 users.' }));
                        return;
                    }

                    currentRoomCode = roomCode;
                    currentPeerId = peerId || `user_${Math.random().toString(36).substr(2, 6)}`;
                    
                    room.peers.set(currentPeerId, {
                        ws,
                        peerId: currentPeerId,
                        joinedAt: Date.now()
                    });

                    console.log(`[Room ${roomCode}] Peer ${currentPeerId} joined (${room.peers.size}/2)`);

                    // Notify joining peer
                    ws.send(JSON.stringify({
                        type: 'JOIN_SUCCESS',
                        roomCode,
                        peerId: currentPeerId,
                        peerCount: room.peers.size
                    }));

                    // Broadcast ROOM_UPDATED to all peers in room
                    broadcastToRoom(roomCode, {
                        type: 'PEER_JOINED',
                        peerId: currentPeerId,
                        peerCount: room.peers.size
                    }, currentPeerId);
                    break;
                }

                case 'SYNC_COMMAND': {
                    // Relays play, pause, seek, skip_10, rewind_10, torrent add, state update
                    if (currentRoomCode && rooms.has(currentRoomCode)) {
                        broadcastToRoom(currentRoomCode, {
                            type: 'SYNC_COMMAND',
                            senderId: currentPeerId,
                            timestamp: Date.now(),
                            payload
                        }, currentPeerId);
                    }
                    break;
                }

                case 'CHAT_MESSAGE': {
                    // Relays overlay chat messages to partner
                    if (currentRoomCode && rooms.has(currentRoomCode)) {
                        broadcastToRoom(currentRoomCode, {
                            type: 'CHAT_MESSAGE',
                            senderId: currentPeerId,
                            timestamp: Date.now(),
                            payload
                        }, currentPeerId);
                    }
                    break;
                }

                case 'WEBRTC_SIGNAL': {
                    // Relays WebRTC offer, answer, ice-candidates
                    if (currentRoomCode && rooms.has(currentRoomCode)) {
                        broadcastToRoom(currentRoomCode, {
                            type: 'WEBRTC_SIGNAL',
                            senderId: currentPeerId,
                            payload
                        }, currentPeerId);
                    }
                    break;
                }

                case 'PING': {
                    ws.send(JSON.stringify({ type: 'PONG', clientTime: payload?.clientTime, serverTime: Date.now() }));
                    break;
                }

                default:
                    console.log(`[WebSocket] Unknown type: ${type}`);
            }
        } catch (err) {
            console.error('[WebSocket Error]', err);
        }
    });

    ws.on('close', () => {
        if (currentRoomCode && currentPeerId) {
            const room = rooms.get(currentRoomCode);
            if (room) {
                room.peers.delete(currentPeerId);
                console.log(`[Room ${currentRoomCode}] Peer ${currentPeerId} left (${room.peers.size}/2)`);
                
                broadcastToRoom(currentRoomCode, {
                    type: 'PEER_LEFT',
                    peerId: currentPeerId,
                    peerCount: room.peers.size
                });

                if (room.peers.size === 0) {
                    rooms.delete(currentRoomCode);
                    console.log(`[Room ${currentRoomCode}] Closed (empty)`);
                }
            }
        }
    });
});

function broadcastToRoom(roomCode, data, excludePeerId = null) {
    const room = rooms.get(roomCode);
    if (!room) return;
    for (const [peerId, peer] of room.peers.entries()) {
        if (peerId !== excludePeerId && peer.ws.readyState === WebSocket.OPEN) {
            peer.ws.send(JSON.stringify(data));
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Couple Sync Signaling Server running on port ${PORT}`);
    console.log(`=================================================`);
});
