'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  currentUserId,
  onSendMessage,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-bg-subtle/95 backdrop-blur-xl border-l border-bg-border z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-display text-cream tracking-wider">
              LIVE CHAT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cream-muted hover:text-cream p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message stream */}
        <ChatMessageList messages={messages} currentUserId={currentUserId} />

        {/* Input box */}
        <ChatInput onSendMessage={onSendMessage} />
      </aside>
    </>
  );
};
