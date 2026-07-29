package org.couple.syncplayer.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PrimaryPink = Color(0xFFFF4081)
val PrimaryPinkDark = Color(0xFFC2185B)
val AccentPurple = Color(0xFF7C4DFF)
val BackgroundDark = Color(0xFF0D0E15)
val SurfaceDark = Color(0xFF161823)
val TextWhite = Color(0xFFFFFFFF)
val TextMuted = Color(0xFFA0A5C0)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryPink,
    secondary = AccentPurple,
    background = BackgroundDark,
    surface = SurfaceDark,
    onPrimary = TextWhite,
    onSecondary = TextWhite,
    onBackground = TextWhite,
    onSurface = TextWhite
)

@Composable
fun CoupleSyncPlayerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
