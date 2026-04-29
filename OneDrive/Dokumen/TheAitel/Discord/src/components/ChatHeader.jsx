import React from 'react';
import { Hash, Bell, Pin, Users, Search, HelpCircle, Menu } from 'lucide-react';

const ChatHeader = ({ roomName, onMenuClick }) => {
  return (
    <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-discord-chat/80 backdrop-blur-md shadow-sm shrink-0 relative overflow-hidden">
      {/* Vibrant top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white mr-1 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1.5 rounded-lg border border-white/5 shadow-inner">
          <Hash className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100 text-lg tracking-wide truncate max-w-[200px] sm:max-w-xs">{roomName}</h2>
      </div>
      
      <div className="hidden md:flex items-center gap-4 text-discord-muted relative z-10">
        <button className="hover:text-blue-400 transition-colors hover:scale-110 active:scale-95"><Bell className="w-5 h-5" /></button>
        <button className="hover:text-purple-400 transition-colors hover:scale-110 active:scale-95"><Pin className="w-5 h-5" /></button>
        <button className="hover:text-pink-400 transition-colors hover:scale-110 active:scale-95"><Users className="w-5 h-5" /></button>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-black/30 border border-white/5 text-xs rounded-full py-1.5 pl-3 pr-8 w-40 focus:w-64 transition-all outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder:text-white/30"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 group-focus-within:text-purple-400 transition-colors" />
        </div>
        <button className="hover:text-discord-accent transition-colors hover:scale-110 active:scale-95"><HelpCircle className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export default ChatHeader;
