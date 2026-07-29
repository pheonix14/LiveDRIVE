package org.couple.syncplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FolderSpecial
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.couple.syncplayer.ui.theme.AccentPurple
import org.couple.syncplayer.ui.theme.BackgroundDark
import org.couple.syncplayer.ui.theme.PrimaryPink

@Composable
fun PermissionsScreen(
    onGrantPermissionsClicked: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(24.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize()
        ) {

            Text(
                text = "Couple Sync Player",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryPink
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Required Permissions Setup",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Permission Items List
            PermissionCard(
                icon = Icons.Default.Movie,
                title = "Gallery & Video Permission",
                description = "Required to browse, detect, and play local video files from your device."
            )
            Spacer(modifier = Modifier.height(12.dp))

            PermissionCard(
                icon = Icons.Default.FolderSpecial,
                title = "Files & Storage Permission",
                description = "Required to store downloaded torrent video files and read external media."
            )
            Spacer(modifier = Modifier.height(12.dp))

            PermissionCard(
                icon = Icons.Default.Wifi,
                title = "Internet & Network Access",
                description = "Required for low-latency real-time video sync, P2P connection, & torrent downloads."
            )
            Spacer(modifier = Modifier.height(12.dp))

            PermissionCard(
                icon = Icons.Default.Notifications,
                title = "Foreground Service & Notifications",
                description = "Keeps video playback and sync active in the background and picture-in-picture mode."
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = onGrantPermissionsClicked,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "Grant Required Permissions",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun PermissionCard(
    icon: ImageVector,
    title: String,
    description: String
) {
    Surface(
        color = Color(0xFF161823),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(14.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = AccentPurple,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    color = Color.Gray,
                    fontSize = 11.sp
                )
            }
        }
    }
}
