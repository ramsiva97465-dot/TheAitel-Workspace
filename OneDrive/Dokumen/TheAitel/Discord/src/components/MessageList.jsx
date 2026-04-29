import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

const MessageList = ({ messages, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-discord-accent" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-discord-sidebar rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">👋</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Welcome to the beginning!</h3>
        <p className="text-discord-muted max-w-xs">
          This is the start of this channel. Send a message to get things going.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pt-4 relative bg-gradient-to-b from-transparent via-discord-accent/5 to-transparent custom-scrollbar">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-1 pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className="h-8" />
      </div>
    </div>
  );
};

export default MessageList;
