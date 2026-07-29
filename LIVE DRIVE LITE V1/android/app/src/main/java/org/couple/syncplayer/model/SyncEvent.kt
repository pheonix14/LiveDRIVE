package org.couple.syncplayer.model

enum class SyncAction {
    PLAY,
    PAUSE,
    SEEK,
    SKIP_10S,
    REWIND_10S,
    SPEED_CHANGE,
    ADD_TORRENT,
    SYNC_STATE_PING,
    SYNC_STATE_ALIGN
}

data class SyncEvent(
    val action: SyncAction,
    val roomId: String,
    val senderId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val positionMs: Long = 0L,
    val durationMs: Long = 0L,
    val playbackSpeed: Float = 1.0f,
    val isPlaying: Boolean = false,
    val magnetUrl: String? = null,
    val torrentInfoHash: String? = null,
    val videoTitle: String? = null
)
