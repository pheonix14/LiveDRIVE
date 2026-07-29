package org.couple.syncplayer.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.couple.syncplayer.model.ChatMessage
import org.couple.syncplayer.ui.theme.AccentPurple
import org.couple.syncplayer.ui.theme.PrimaryPink

@Composable
fun ChatOverlay(
    messages: List<ChatMessage>,
    onSendMessage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isChatVisible by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    var unreadCount by remember { mutableIntStateOf(0) }

    LaunchedEffect(messages.size) {
        if (!isChatVisible && messages.isNotEmpty()) {
            unreadCount++
        }
    }

    Box(modifier = modifier.fillMaxSize()) {

        // Explicit "Hide Chat" / "Show Chat" Toggle Button
        FloatingActionButton(
            onClick = {
                isChatVisible = !isChatVisible
                if (isChatVisible) {
                    unreadCount = 0
                }
            },
            containerColor = PrimaryPink,
            contentColor = Color.White,
            shape = CircleShape,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
        ) {
            BadgedBox(
                badge = {
                    if (unreadCount > 0 && !isChatVisible) {
                        Badge(containerColor = AccentPurple) {
                            Text(text = unreadCount.toString(), color = Color.White)
                        }
                    }
                }
            ) {
                Icon(
                    imageVector = if (isChatVisible) Icons.Default.Close else Icons.Default.Chat,
                    contentDescription = if (isChatVisible) "Hide Chat" else "Show Chat"
                )
            }
        }

        // Animated Floating Chat Drawer
        AnimatedVisibility(
            visible = isChatVisible,
            enter = slideInHorizontally(initialLineWidth = { it }),
            exit = slideOutHorizontally(targetLineWidth = { it }),
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .fillMaxHeight(0.75f)
                .width(280.dp)
                .padding(end = 16.dp, top = 64.dp, bottom = 64.dp)
        ) {
            Surface(
                color = Color(0xEB161823),
                shape = RoundedCornerShape(16.dp),
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxSize()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp)
                ) {
                    // Chat Header with Hide Button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Couple Chat ❤️",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Button(
                            onClick = { isChatVisible = false },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.15f)),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier.height(28.dp)
                        ) {
                            Text("Hide Chat", fontSize = 11.sp, color = Color.White)
                        }
                    }

                    Divider(color = Color.White.copy(alpha = 0.1f), modifier = Modifier.padding(vertical = 8.dp))

                    // Messages List
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        reverseLayout = true
                    ) {
                        items(messages.reversed()) { msg ->
                            ChatMessageBubble(msg = msg)
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Input Field & Send Button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text("Type message...", color = Color.Gray, fontSize = 12.sp) },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.White.copy(alpha = 0.08f),
                                unfocusedContainerColor = Color.White.copy(alpha = 0.05f),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            shape = RoundedCornerShape(20.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        IconButton(
                            onClick = {
                                if (inputText.isNotBlank()) {
                                    onSendMessage(inputText.trim())
                                    inputText = ""
                                }
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .background(PrimaryPink, CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChatMessageBubble(msg: ChatMessage) {
    val bubbleColor = if (msg.isMine) PrimaryPink.copy(alpha = 0.85f) else AccentPurple.copy(alpha = 0.85f)
    val alignment = if (msg.isMine) Alignment.End else Alignment.Start

    Column(
        horizontalAlignment = alignment,
        modifier = Modifier.fillMaxWidth()
    ) {
        Surface(
            color = bubbleColor,
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = msg.text,
                color = Color.White,
                fontSize = 13.sp,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
            )
        }
    }
}
