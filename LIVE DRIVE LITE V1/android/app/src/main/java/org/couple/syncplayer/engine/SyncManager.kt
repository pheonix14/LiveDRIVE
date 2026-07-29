package org.couple.syncplayer.engine

import android.util.Log
import com.google.gson.Gson
import org.couple.syncplayer.model.ChatMessage
import org.couple.syncplayer.model.SyncAction
import org.couple.syncplayer.model.SyncEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

class SyncManager(private val serverUrl: String = "ws://10.0.2.2:3000") {

    private val TAG = "SyncManager"
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private val gson = Gson()
    private var webSocket: WebSocket? = null

    val isConnected = MutableStateFlow(false)
    val currentRoomCode = MutableStateFlow<String?>(null)
    val peerCount = MutableStateFlow(0)
    val peerId = "user_" + java.util.UUID.randomUUID().toString().substring(0, 6)

    private val _incomingSyncEvents = MutableSharedFlow<SyncEvent>()
    val incomingSyncEvents: SharedFlow<SyncEvent> = _incomingSyncEvents

    private val _incomingChatMessages = MutableSharedFlow<ChatMessage>()
    val incomingChatMessages: SharedFlow<ChatMessage> = _incomingChatMessages

    private val scope = CoroutineScope(Dispatchers.IO)

    fun connectAndJoinRoom(roomCode: String) {
        val request = Request.Builder().url(serverUrl).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: okhttp3.Response) {
                Log.d(TAG, "WebSocket Connection Opened")
                isConnected.value = true
                currentRoomCode.value = roomCode

                // Send JOIN_ROOM message
                val joinMessage = mapOf(
                    "type" to "JOIN_ROOM",
                    "roomCode" to roomCode,
                    "peerId" to peerId
                )
                ws.send(gson.toJson(joinMessage))
            }

            override fun onMessage(ws: WebSocket, text: String) {
                try {
                    val map = gson.fromJson(text, Map::class.java)
                    val type = map["type"] as? String

                    when (type) {
                        "JOIN_SUCCESS" -> {
                            val count = (map["peerCount"] as? Double)?.toInt() ?: 1
                            peerCount.value = count
                            Log.d(TAG, "Successfully joined room $roomCode ($count/2 peers)")
                        }
                        "PEER_JOINED" -> {
                            val count = (map["peerCount"] as? Double)?.toInt() ?: 2
                            peerCount.value = count
                            Log.d(TAG, "Partner connected! ($count/2 peers)")
                        }
                        "PEER_LEFT" -> {
                            val count = (map["peerCount"] as? Double)?.toInt() ?: 1
                            peerCount.value = count
                            Log.d(TAG, "Partner disconnected ($count/2 peers)")
                        }
                        "SYNC_COMMAND" -> {
                            val payloadJson = gson.toJson(map["payload"])
                            val syncEvent = gson.fromJson(payloadJson, SyncEvent::class.java)
                            if (syncEvent.senderId != peerId) {
                                scope.launch {
                                    _incomingSyncEvents.emit(syncEvent)
                                }
                            }
                        }
                        "CHAT_MESSAGE" -> {
                            val payloadJson = gson.toJson(map["payload"])
                            val msg = gson.fromJson(payloadJson, ChatMessage::class.java)
                            if (msg.senderId != peerId) {
                                scope.launch {
                                    _incomingChatMessages.emit(msg)
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error handling WS message: ${e.message}")
                }
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: okhttp3.Response?) {
                Log.e(TAG, "WebSocket Connection Failed: ${t.message}")
                isConnected.value = false
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket Closed")
                isConnected.value = false
            }
        })
    }

    fun broadcastSyncAction(
        action: SyncAction,
        positionMs: Long,
        durationMs: Long,
        isPlaying: Boolean,
        playbackSpeed: Float = 1.0f,
        magnetUrl: String? = null
    ) {
        val roomCode = currentRoomCode.value ?: return
        val event = SyncEvent(
            action = action,
            roomId = roomCode,
            senderId = peerId,
            positionMs = positionMs,
            durationMs = durationMs,
            isPlaying = isPlaying,
            playbackSpeed = playbackSpeed,
            magnetUrl = magnetUrl
        )

        val packet = mapOf(
            "type" to "SYNC_COMMAND",
            "roomCode" to roomCode,
            "peerId" to peerId,
            "payload" to event
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun sendChatMessage(text: String, senderName: String = "Partner") {
        val roomCode = currentRoomCode.value ?: return
        val chatMsg = ChatMessage(
            senderId = peerId,
            senderName = senderName,
            text = text,
            isMine = true
        )

        val packet = mapOf(
            "type" to "CHAT_MESSAGE",
            "roomCode" to roomCode,
            "peerId" to peerId,
            "payload" to chatMsg
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun disconnect() {
        webSocket?.close(1000, "User Left Room")
        isConnected.value = false
        currentRoomCode.value = null
    }
}
