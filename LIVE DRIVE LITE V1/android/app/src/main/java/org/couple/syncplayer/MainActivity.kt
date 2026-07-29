package org.couple.syncplayer

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import org.couple.syncplayer.service.PlaybackSyncService
import org.couple.syncplayer.ui.screens.PairingScreen
import org.couple.syncplayer.ui.screens.PermissionsScreen
import org.couple.syncplayer.ui.screens.PlayerScreen
import org.couple.syncplayer.ui.theme.BackgroundDark
import org.couple.syncplayer.ui.theme.CoupleSyncPlayerTheme

sealed class AppScreen {
    object Permissions : AppScreen()
    object Pairing : AppScreen()
    data class Player(val roomCode: String, val serverUrl: String) : AppScreen()
}

class MainActivity : ComponentActivity() {

    private var currentScreenState = mutableStateOf<AppScreen>(AppScreen.Permissions)

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (allGranted || hasCorePermissions()) {
            startForegroundSyncService()
            currentScreenState.value = AppScreen.Pairing
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()

        if (hasCorePermissions()) {
            startForegroundSyncService()
            currentScreenState.value = AppScreen.Pairing
        }

        setContent {
            CoupleSyncPlayerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BackgroundDark
                ) {
                    val currentScreen by remember { currentScreenState }

                    when (val screen = currentScreen) {
                        is AppScreen.Permissions -> {
                            PermissionsScreen(
                                onGrantPermissionsClicked = {
                                    requestRequiredPermissions()
                                }
                            )
                        }
                        is AppScreen.Pairing -> {
                            PairingScreen(
                                onPairSuccess = { roomCode, serverUrl ->
                                    currentScreenState.value = AppScreen.Player(roomCode, serverUrl)
                                }
                            )
                        }
                        is AppScreen.Player -> {
                            PlayerScreen(
                                roomCode = screen.roomCode,
                                serverUrl = screen.serverUrl,
                                onLeaveRoom = {
                                    currentScreenState.value = AppScreen.Pairing
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun hasCorePermissions(): Boolean {
        val permissionsToVerify = mutableListOf(Manifest.permission.INTERNET)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToVerify.add(Manifest.permission.READ_MEDIA_VIDEO)
        } else {
            permissionsToVerify.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        return permissionsToVerify.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestRequiredPermissions() {
        val permissionsToRequest = mutableListOf(
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_NETWORK_STATE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.READ_MEDIA_VIDEO)
            permissionsToRequest.add(Manifest.permission.READ_MEDIA_AUDIO)
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            permissionsToRequest.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }

        permissionLauncher.launch(permissionsToRequest.toTypedArray())
    }

    private fun startForegroundSyncService() {
        try {
            val serviceIntent = Intent(this, PlaybackSyncService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
