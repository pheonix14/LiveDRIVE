package org.couple.syncplayer.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VideoFile
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import org.videolan.libvlc.util.VLCVideoLayout
import org.couple.syncplayer.engine.SyncManager
import org.couple.syncplayer.engine.TorrentStreamEngine
import org.couple.syncplayer.engine.VlcPlayerEngine
import org.couple.syncplayer.model.ChatMessage
import org.couple.syncplayer.model.SyncAction
import org.couple.syncplayer.ui.components.ChatOverlay
import org.couple.syncplayer.ui.components.TorrentPanel
import org.couple.syncplayer.ui.components.TransportControls
import org.couple.syncplayer.ui.theme.BackgroundDark
import org.couple.syncplayer.ui.theme.PrimaryPink
import kotlinx.coroutines.flow.collectLatest

@Composable
fun PlayerScreen(
    roomCode: String,
    serverUrl: String,
    onLeaveRoom: () -> Unit
) {
    val context = LocalContext.current

    // Engines
    val vlcEngine = remember { VlcPlayerEngine(context) }
    val torrentEngine = remember { TorrentStreamEngine(context) }
    val syncManager = remember { SyncManager(serverUrl) }

    // States
    val isPlaying by vlcEngine.isPlaying.collectAsState()
    val currentPositionMs by vlcEngine.currentPositionMs.collectAsState()
    val durationMs by vlcEngine.durationMs.collectAsState()
    val playbackSpeed by vlcEngine.playbackSpeed.collectAsState()

    val isDownloading by torrentEngine.isDownloading.collectAsState()
    val downloadProgress by torrentEngine.downloadProgress.collectAsState()
    val downloadSpeed by torrentEngine.downloadSpeedBytes.collectAsState()

    val peerCount by syncManager.peerCount.collectAsState()
    val chatMessages = remember { mutableStateListOf<ChatMessage>() }

    var currentVideoUri by remember { mutableStateOf<String?>(null) }
    var isControlsVisible by remember { mutableStateOf(true) }

    // Media Picker Launcher (Gallery / Videos / Files)
    val videoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            currentVideoUri = it.toString()
            vlcEngine.playMedia(it.toString())
        }
    }

    // Connect to room & listen for partner sync events
    LaunchedEffect(roomCode) {
        syncManager.connectAndJoinRoom(roomCode)

        // Handle incoming sync actions from Partner
        syncManager.incomingSyncEvents.collectLatest { event ->
            when (event.action) {
                SyncAction.PLAY -> vlcEngine.play()
                SyncAction.PAUSE -> vlcEngine.pause()
                SyncAction.SEEK, SyncAction.SKIP_10S, SyncAction.REWIND_10S -> {
                    vlcEngine.seekTo(event.positionMs)
                }
                SyncAction.SPEED_CHANGE -> vlcEngine.setSpeed(event.playbackSpeed)
                SyncAction.ADD_TORRENT -> {
                    // Partner started a torrent -> start downloading & streaming on this phone automatically too!
                    event.magnetUrl?.let { magnet ->
                        torrentEngine.startTorrentStream(magnet) { streamUrl ->
                            currentVideoUri = streamUrl
                            vlcEngine.playMedia(streamUrl)
                        }
                    }
                }
                else -> {}
            }
        }
    }

    // Listen for incoming chat messages
    LaunchedEffect(Unit) {
        syncManager.incomingChatMessages.collectLatest { msg ->
            chatMessages.add(msg)
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            vlcEngine.release()
            torrentEngine.release()
            syncManager.disconnect()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {

        // LibVLC Native Player AndroidView Layer
        AndroidView(
            factory = { ctx ->
                VLCVideoLayout(ctx).apply {
                    vlcEngine.attachVideoLayout(this)
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Empty state overlay if no video loaded
        if (currentVideoUri == null) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp)
            ) {
                Text(
                    text = "No Video Playing",
                    fontSize = 20.sp,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { videoPickerLauncher.launch("video/*") },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink)
                ) {
                    Icon(imageVector = Icons.Default.VideoFile, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Select Local Video from Gallery / Files")
                }
            }
        }

        // Torrent Streaming & Mirror Panel (Top Overlay)
        TorrentPanel(
            isDownloading = isDownloading,
            downloadProgress = downloadProgress,
            downloadSpeed = downloadSpeed,
            onStartTorrent = { magnetUrl ->
                torrentEngine.startTorrentStream(magnetUrl) { streamUrl ->
                    currentVideoUri = streamUrl
                    vlcEngine.playMedia(streamUrl)

                    // Mirror torrent download start to partner's phone instantly
                    syncManager.broadcastSyncAction(
                        action = SyncAction.ADD_TORRENT,
                        positionMs = 0L,
                        durationMs = 0L,
                        isPlaying = true,
                        magnetUrl = magnetUrl
                    )
                }
            },
            modifier = Modifier.align(Alignment.TopCenter)
        )

        // Transport Controls (Bottom Overlay: Rewind 10s, Play/Pause, Skip 10s, Seekbar)
        TransportControls(
            isPlaying = isPlaying,
            currentPositionMs = currentPositionMs,
            durationMs = durationMs,
            playbackSpeed = playbackSpeed,
            isPartnerSynced = peerCount >= 2,
            onPlayPauseToggle = {
                vlcEngine.togglePlayPause()
                syncManager.broadcastSyncAction(
                    action = if (vlcEngine.isPlaying.value) SyncAction.PLAY else SyncAction.PAUSE,
                    positionMs = vlcEngine.currentPositionMs.value,
                    durationMs = vlcEngine.durationMs.value,
                    isPlaying = vlcEngine.isPlaying.value
                )
            },
            onRewind10s = {
                vlcEngine.rewind10SecondsBackward()
                syncManager.broadcastSyncAction(
                    action = SyncAction.REWIND_10S,
                    positionMs = vlcEngine.currentPositionMs.value,
                    durationMs = vlcEngine.durationMs.value,
                    isPlaying = isPlaying
                )
            },
            onSkip10s = {
                vlcEngine.skip10SecondsForward()
                syncManager.broadcastSyncAction(
                    action = SyncAction.SKIP_10S,
                    positionMs = vlcEngine.currentPositionMs.value,
                    durationMs = vlcEngine.durationMs.value,
                    isPlaying = isPlaying
                )
            },
            onSeekTo = { targetMs ->
                vlcEngine.seekTo(targetMs)
                syncManager.broadcastSyncAction(
                    action = SyncAction.SEEK,
                    positionMs = targetMs,
                    durationMs = durationMs,
                    isPlaying = isPlaying
                )
            },
            onSpeedChange = { newSpeed ->
                vlcEngine.setSpeed(newSpeed)
                syncManager.broadcastSyncAction(
                    action = SyncAction.SPEED_CHANGE,
                    positionMs = currentPositionMs,
                    durationMs = durationMs,
                    isPlaying = isPlaying,
                    playbackSpeed = newSpeed
                )
            },
            modifier = Modifier.align(Alignment.BottomCenter)
        )

        // Floating In-Player Chat Overlay with Hide Chat / Show Chat toggle button
        ChatOverlay(
            messages = chatMessages,
            onSendMessage = { text ->
                val myMessage = ChatMessage(
                    senderId = syncManager.peerId,
                    senderName = "Me",
                    text = text,
                    isMine = true
                )
                chatMessages.add(myMessage)
                syncManager.sendChatMessage(text)
            }
        )
    }
}
