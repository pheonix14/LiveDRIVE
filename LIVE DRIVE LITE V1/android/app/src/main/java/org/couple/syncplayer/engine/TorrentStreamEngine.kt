package org.couple.syncplayer.engine

import android.content.Context
import android.util.Log
import fi.iki.elonen.NanoHTTPD
import com.frostwire.jlibtorrent.SessionManager
import com.frostwire.jlibtorrent.TorrentHandle
import com.frostwire.jlibtorrent.Priority
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.File
import java.io.FileInputStream

class TorrentStreamEngine(private val context: Context) {

    private val TAG = "TorrentStreamEngine"
    private var sessionManager: SessionManager? = null
    private var currentTorrentHandle: TorrentHandle? = null
    private var httpProxyServer: LocalHttpStreamServer? = null

    val downloadProgress = MutableStateFlow(0f)
    val downloadSpeedBytes = MutableStateFlow(0L)
    val isDownloading = MutableStateFlow(false)
    val currentStreamUrl = MutableStateFlow<String?>(null)

    private val downloadDir: File by lazy {
        File(context.getExternalFilesDir(null), "CoupleTorrentDownloads").apply {
            if (!exists()) mkdirs()
        }
    }

    init {
        startTorrentSession()
        startLocalHttpProxy()
    }

    private fun startTorrentSession() {
        try {
            sessionManager = SessionManager().apply {
                start()
            }
            Log.d(TAG, "LibTorrent Session Started Successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start LibTorrent session: ${e.message}")
        }
    }

    private fun startLocalHttpProxy() {
        try {
            httpProxyServer = LocalHttpStreamServer(8080, downloadDir)
            httpProxyServer?.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)
            Log.d(TAG, "Local HTTP Proxy Streaming Server started on http://127.0.0.1:8080")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start local HTTP proxy: ${e.message}")
        }
    }

    fun startTorrentStream(magnetUrl: String, onStreamReady: (String) -> Unit) {
        try {
            isDownloading.value = true
            Log.d(TAG, "Adding magnet URL for high-speed download: $magnetUrl")

            val session = sessionManager ?: return
            session.download(magnetUrl, downloadDir)

            // Enable sequential download mode for instant streaming
            val handles = session.torrents()
            if (handles.isNotEmpty()) {
                val handle = handles.last()
                currentTorrentHandle = handle
                handle.setSequentialDownload(true)
                
                // Prioritize head and tail pieces for video headers & metadata
                val torrentInfo = handle.torrentFile()
                if (torrentInfo != null) {
                    val numPieces = torrentInfo.numPieces()
                    for (i in 0 until 5.coerceAtMost(numPieces)) {
                        handle.piecePriority(i, Priority.TOP_PRIORITY)
                    }
                    for (i in (numPieces - 5).coerceAtLeast(0) until numPieces) {
                        handle.piecePriority(i, Priority.TOP_PRIORITY)
                    }
                }
            }

            // Stream local HTTP URL
            val streamUrl = "http://127.0.0.1:8080/stream?magnet=${UriEncode(magnetUrl)}"
            currentStreamUrl.value = streamUrl
            onStreamReady(streamUrl)

        } catch (e: Exception) {
            Log.e(TAG, "Torrent stream error: ${e.message}", e)
        }
    }

    fun stopTorrent() {
        currentTorrentHandle?.pause()
        isDownloading.value = false
    }

    fun release() {
        httpProxyServer?.stop()
        sessionManager?.stop()
    }

    private fun UriEncode(text: String): String {
        return java.net.URLEncoder.encode(text, "UTF-8")
    }

    private class LocalHttpStreamServer(port: Int, private val rootDir: File) : NanoHTTPD(port) {
        override fun serve(session: IHTTPSession): Response {
            val files = rootDir.listFiles()
            val targetFile = files?.firstOrNull { it.name.endsWith(".mp4") || it.name.endsWith(".mkv") || it.name.endsWith(".avi") }
                ?: files?.firstOrNull()

            if (targetFile != null && targetFile.exists()) {
                val mime = when {
                    targetFile.name.endsWith(".mp4") -> "video/mp4"
                    targetFile.name.endsWith(".mkv") -> "video/x-matroska"
                    else -> "video/*"
                }
                val fis = FileInputStream(targetFile)
                return newFixedLengthResponse(Response.Status.OK, mime, fis, targetFile.length())
            }
            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Torrent video file not ready yet")
        }
    }
}
