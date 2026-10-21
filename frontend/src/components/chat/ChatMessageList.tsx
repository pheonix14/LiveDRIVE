'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { formatTimecode } from '@/lib/formatters';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-cream-darker text-xs">
          <span>No messages yet. Say hello to the room!</span>
        </div>
      ) : (
        messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[11px] font-medium text-cream-darker bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col text-xs leading-relaxed max-w-[85%] ${
                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 select-none">
                <span
                  className="font-bold text-[11px]"
                  style={{ color: msg.senderColor || '#F2C12E' }}
                >
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="text-[10px] text-cream-darker">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl break-words ${
                  isMe
                    ? 'bg-gold/15 text-cream border border-gold/25 rounded-tr-none'
                    : 'bg-bg-card text-cream border border-white/5 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};
