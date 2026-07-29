package org.couple.syncplayer.model

data class MediaItem(
    val id: String,
    val title: String,
    val uri: String,
    val durationMs: Long = 0L,
    val sizeBytes: Long = 0L,
    val isTorrent: Boolean = false,
    val magnetUrl: String? = null,
    val torrentProgress: Float = 0f,
    val downloadSpeedBytesPerSec: Long = 0L
)
