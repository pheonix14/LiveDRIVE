'use client';

import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);

  const emojis = ['🍿', '🔥', '😂', '👏', '😱', '❤️', '🎬', '⚡'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    setShowEmojis(false);
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmojis(false);
  };

  return (
    <div className="p-3 border-t border-white/5 bg-bg-card/70 relative">
      {showEmojis && (
        <div className="absolute bottom-full left-3 mb-2 bg-bg-elevated border border-white/10 rounded-xl p-2 shadow-xl flex gap-1.5 backdrop-blur-md">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="text-cream-muted hover:text-gold p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Smile size={18} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-bg-subtle border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cream placeholder-cream-darker focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gold text-bg p-2 rounded-xl font-bold hover:bg-gold-hover disabled:opacity-30 disabled:hover:bg-gold transition-all shadow-[0_0_10px_rgba(242,193,46,0.2)]"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
