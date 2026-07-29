package org.couple.syncplayer.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.couple.syncplayer.ui.theme.AccentPurple
import org.couple.syncplayer.ui.theme.PrimaryPink

@Composable
fun TorrentPanel(
    isDownloading: Boolean,
    downloadProgress: Float,
    downloadSpeed: Long,
    onStartTorrent: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var magnetInput by remember { mutableStateOf("") }
    var isExpanded by remember { mutableStateOf(false) }

    Surface(
        color = Color(0xEB161823),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CloudDownload,
                        contentDescription = "Torrent",
                        tint = PrimaryPink
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Super Fast Torrent Downloader & Mirror",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                TextButton(onClick = { isExpanded = !isExpanded }) {
                    Text(
                        text = if (isExpanded) "Hide" else "Expand",
                        color = PrimaryPink,
                        fontSize = 12.sp
                    )
                }
            }

            if (isDownloading) {
                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { downloadProgress },
                    color = PrimaryPink,
                    trackColor = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Downloading: ${(downloadProgress * 100).toInt()}%",
                        color = Color.White,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Speed: ${downloadSpeed / 1024} KB/s (Auto-Mirrored)",
                        color = AccentPurple,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            if (isExpanded) {
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = magnetInput,
                    onValueChange = { magnetInput = it },
                    placeholder = { Text("Paste magnet:?xt=urn:btih:... link", color = Color.Gray, fontSize = 12.sp) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryPink,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.3f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = {
                        if (magnetInput.isNotBlank()) {
                            onStartTorrent(magnetInput.trim())
                            magnetInput = ""
                            isExpanded = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(imageVector = Icons.Default.Download, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Start Download & Mirror to Partner Phone")
                }
            }
        }
    }
}
