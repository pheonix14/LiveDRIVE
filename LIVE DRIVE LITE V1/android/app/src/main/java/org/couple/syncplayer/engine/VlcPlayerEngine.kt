package org.couple.syncplayer.engine

import android.content.Context
import android.net.Uri
import android.util.Log
import org.videolan.libvlc.LibVLC
import org.videolan.libvlc.Media
import org.videolan.libvlc.MediaPlayer
import org.videolan.libvlc.util.VLCVideoLayout
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class VlcPlayerEngine(private val context: Context) {

    private val TAG = "VlcPlayerEngine"
    private var libVLC: LibVLC? = null
    private var mediaPlayer: MediaPlayer? = null

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs

    private val _playbackSpeed = MutableStateFlow(1.0f)
    val playbackSpeed: StateFlow<Float> = _playbackSpeed

    private val _isBuffering = MutableStateFlow(false)
    val isBuffering: StateFlow<Boolean> = _isBuffering

    private var onPlaybackStateChanged: ((Boolean, Long) -> Unit)? = null

    init {
        initLibVLC()
    }

    private fun initLibVLC() {
        val options = ArrayList<String>().apply {
            add("--vout=android_display,none")
            add("--http-reconnect")
            add("--network-caching=1500")
            add("--clock-jitter=0")
            add("--clock-synchro=0")
            add("-vvv")
        }
        libVLC = LibVLC(context, options)
        mediaPlayer = MediaPlayer(libVLC).apply {
            setEventListener { event ->
                when (event.type) {
                    MediaPlayer.Event.Playing -> {
                        _isPlaying.value = true
                        _isBuffering.value = false
                        Log.d(TAG, "LibVLC Playing")
                    }
                    MediaPlayer.Event.Paused -> {
                        _isPlaying.value = false
                        Log.d(TAG, "LibVLC Paused")
                    }
                    MediaPlayer.Event.Stopped -> {
                        _isPlaying.value = false
                    }
                    MediaPlayer.Event.TimeChanged -> {
                        _currentPositionMs.value = event.timeChanged
                    }
                    MediaPlayer.Event.LengthChanged -> {
                        _durationMs.value = event.lengthChanged
                    }
                    MediaPlayer.Event.Buffering -> {
                        _isBuffering.value = event.buffering < 100f
                    }
                }
            }
        }
    }

    fun attachVideoLayout(videoLayout: VLCVideoLayout) {
        mediaPlayer?.attachViews(videoLayout, null, true, false)
    }

    fun detachVideoLayout() {
        mediaPlayer?.detachViews()
    }

    fun playMedia(mediaUri: String) {
        try {
            val vlc = libVLC ?: return
            val media = Media(vlc, Uri.parse(mediaUri)).apply {
                setHWDecoderEnabled(true, true)
                addOption(":network-caching=1500")
            }
            mediaPlayer?.media = media
            media.release()
            mediaPlayer?.play()
        } catch (e: Exception) {
            Log.e(TAG, "Error playing media: ${e.message}", e)
        }
    }

    fun play() {
        mediaPlayer?.play()
        _isPlaying.value = true
    }

    fun pause() {
        mediaPlayer?.pause()
        _isPlaying.value = false
    }

    fun togglePlayPause() {
        if (_isPlaying.value) {
            pause()
        } else {
            play()
        }
    }

    fun seekTo(positionMs: Long) {
        mediaPlayer?.time = positionMs
        _currentPositionMs.value = positionMs
    }

    fun skip10SecondsForward() {
        val target = (_currentPositionMs.value + 10000L).coerceAtMost(_durationMs.value)
        seekTo(target)
    }

    fun rewind10SecondsBackward() {
        val target = (_currentPositionMs.value - 10000L).coerceAtLeast(0L)
        seekTo(target)
    }

    fun setSpeed(speed: Float) {
        mediaPlayer?.rate = speed
        _playbackSpeed.value = speed
    }

    fun release() {
        mediaPlayer?.stop()
        mediaPlayer?.detachViews()
        mediaPlayer?.release()
        libVLC?.release()
        mediaPlayer = null
        libVLC = null
    }
}
