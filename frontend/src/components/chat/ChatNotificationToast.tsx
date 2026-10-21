'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface ChatNotificationToastProps {
  message: ChatMessage | null;
  onClick: () => void;
  onDismiss: () => void;
}

export const ChatNotificationToast: React.FC<ChatNotificationToastProps> = ({
  message,
  onClick,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div
      onClick={onClick}
      className="fixed bottom-20 right-6 z-40 max-w-sm bg-bg-card border border-gold/40 rounded-xl p-3 shadow-2xl backdrop-blur-md cursor-pointer animate-in slide-in-from-bottom duration-300 flex items-start gap-3 hover:scale-102 transition-transform"
    >
      <div className="p-2 rounded-lg bg-gold/15 text-gold shrink-0">
        <MessageSquare size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="text-xs font-bold truncate"
            style={{ color: message.senderColor || '#F2C12E' }}
          >
            {message.senderName}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-[10px] text-cream-darker hover:text-cream ml-2"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-cream truncate">{message.text}</p>
      </div>
    </div>
  );
};
