package org.couple.syncplayer.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.couple.syncplayer.ui.theme.AccentPurple
import org.couple.syncplayer.ui.theme.PrimaryPink

@Composable
fun TransportControls(
    isPlaying: Boolean,
    currentPositionMs: Long,
    durationMs: Long,
    playbackSpeed: Float,
    isPartnerSynced: Boolean,
    onPlayPauseToggle: () -> Unit,
    onRewind10s: () -> Unit,
    onSkip10s: () -> Unit,
    onSeekTo: (Long) -> Unit,
    onSpeedChange: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    var isSeeking by remember { mutableStateOf(false) }
    var sliderPosition by remember { mutableStateOf(0f) }

    val effectivePosition = if (isSeeking) sliderPosition.toLong() else currentPositionMs

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))
                )
            )
            .padding(16.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {

            // Sync status badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier
                    .background(
                        color = if (isPartnerSynced) Color(0xFF1B5E20) else Color(0xFF827717),
                        shape = RoundedCornerShape(12.dp)
                    )
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = if (isPartnerSynced) Icons.Default.Favorite else Icons.Default.SyncProblem,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isPartnerSynced) "Synced with Partner" else "Waiting for Partner...",
                    color = Color.White,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Seekbar slider & duration text
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = formatTime(effectivePosition),
                    color = Color.White,
                    fontSize = 12.sp
                )
                Slider(
                    value = if (durationMs > 0) effectivePosition.toFloat() else 0f,
                    onValueChange = {
                        isSeeking = true
                        sliderPosition = it
                    },
                    onValueChangeFinished = {
                        isSeeking = false
                        onSeekTo(sliderPosition.toLong())
                    },
                    valueRange = 0f..(durationMs.toFloat().coerceAtLeast(1f)),
                    colors = SliderDefaults.colors(
                        thumbColor = PrimaryPink,
                        activeTrackColor = PrimaryPink,
                        inactiveTrackColor = Color.White.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 8.dp)
                )
                Text(
                    text = formatTime(durationMs),
                    color = Color.White,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main playback control buttons (Rewind 10s, Play/Pause, Skip 10s)
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {

                // Speed button
                IconButton(onClick = {
                    val nextSpeed = when (playbackSpeed) {
                        1.0f -> 1.25f
                        1.25f -> 1.5f
                        1.5f -> 2.0f
                        2.0f -> 0.75f
                        else -> 1.0f
                    }
                    onSpeedChange(nextSpeed)
                }) {
                    Text(
                        text = "${playbackSpeed}x",
                        color = Color.White,
                        fontSize = 13.sp
                    )
                }

                // Rewind 10 seconds button
                IconButton(
                    onClick = onRewind10s,
                    modifier = Modifier.background(Color.White.copy(alpha = 0.15f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Replay10,
                        contentDescription = "Rewind 10s",
                        tint = Color.White
                    )
                }

                // Play / Pause button
                IconButton(
                    onClick = onPlayPauseToggle,
                    modifier = Modifier
                        .size(56.dp)
                        .background(
                            brush = Brush.horizontalGradient(listOf(PrimaryPink, AccentPurple)),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }

                // Forward 10 seconds button
                IconButton(
                    onClick = onSkip10s,
                    modifier = Modifier.background(Color.White.copy(alpha = 0.15f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Forward10,
                        contentDescription = "Skip 10s",
                        tint = Color.White
                    )
                }

                // Aspect ratio / Fullscreen icon placeholder
                IconButton(onClick = { }) {
                    Icon(
                        imageVector = Icons.Default.Fullscreen,
                        contentDescription = "Fullscreen",
                        tint = Color.White
                    )
                }
            }
        }
    }
}

private fun formatTime(timeMs: Long): String {
    val totalSec = timeMs / 1000
    val sec = totalSec % 60
    val min = (totalSec / 60) % 60
    val hrs = totalSec / 3600

    return if (hrs > 0) {
        String.format("%d:%02d:%02d", hrs, min, sec)
    } else {
        String.format("%02d:%02d", min, sec)
    }
}
