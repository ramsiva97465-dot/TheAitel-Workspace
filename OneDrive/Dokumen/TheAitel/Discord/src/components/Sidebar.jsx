import React, { useEffect, useState } from 'react';
import { LogOut, Hash, User, Loader2, AlertCircle, Shield, Mic, MicOff, Headphones, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchRooms } from '../services/roomService';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeRoomId, onRoomSelect }) => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const navigate = useNavigate();
  const settingsMenuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const getRooms = async () => {
      try {
        setLoading(true);
        const roomsData = await fetchRooms();
        
        let filtered = roomsData;
        if (user?.role !== 'admin') {
          const roleToRoom = {
            'prompt-engineer': 'prompt-engineers',
            'developer': 'developers',
            'business-development-executive': 'business-development-executive'
          };
          const allowedRoomId = roleToRoom[user?.role];
          // Always allow access to the 'general' room
          filtered = roomsData.filter(r => r.id === allowedRoomId || r.id === 'general');
        }

        setRooms(filtered);
        if (filtered.length > 0 && !activeRoomId) {
          onRoomSelect(filtered[0].id);
        }
      } catch (err) {
        setError('Failed to load rooms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role && user.role !== 'unassigned') {
      getRooms();
    } else {
      setLoading(false);
    }
  }, [onRoomSelect, activeRoomId, user?.role]);

  const toggleMute = () => {
    if (isDeafened && isMuted) {
      setIsDeafened(false);
      setIsMuted(false);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const toggleDeafen = () => {
    if (!isDeafened) {
      setIsDeafened(true);
      setIsMuted(true);
    } else {
      setIsDeafened(false);
    }
  };

  return (
    <div className="w-60 bg-discord-sidebar h-full flex flex-col shrink-0 border-r border-black/20">
      {/* Header */}
      <div className="h-16 relative flex items-center justify-between px-4 cursor-pointer group bg-black overflow-hidden shrink-0">
        {/* Elegant ambient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Aitel" className="h-10 w-auto object-contain brightness-150 contrast-125 transition-transform duration-500 group-hover:scale-105" />
          </div>
          
          <div className="flex items-center gap-2">
            {user?.role && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-shadow whitespace-nowrap">
                {user.role === 'business-development-executive' ? 'BDE' : 
                 user.role === 'prompt-engineer' ? 'Prompt Eng' : 
                 user.role.replace('-', ' ')}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Premium glowing bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-400/60 transition-colors duration-500"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2 custom-scrollbar">
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded mb-4 text-discord-accent hover:bg-discord-accent/10 transition-all active:scale-95 group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold truncate uppercase text-[10px] tracking-wider">Employee Management</span>
          </button>
        )}

        <div className="px-2 mb-2">
          <p className="text-[10px] font-bold text-discord-muted uppercase tracking-widest">Channels</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-discord-muted" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-2 py-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : rooms.length === 0 ? (
          <p className="px-2 py-2 text-discord-muted text-xs italic">
            {user?.role === 'unassigned' ? 'Awaiting assignment...' : 'No channels'}
          </p>
        ) : (
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all group ${
                activeRoomId === room.id 
                  ? 'bg-discord-active text-white' 
                  : 'text-discord-muted hover:bg-discord-hover hover:text-discord-text'
              }`}
            >
              <Hash className={`w-5 h-5 ${activeRoomId === room.id ? 'text-white' : 'text-discord-muted'}`} />
              <span className="font-medium text-sm truncate">{room.name}</span>
            </button>
          ))
        )}
      </div>

      {/* User Footer */}
      <div className="bg-[#232428] h-[52px] px-2 flex items-center shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0 hover:bg-white/5 p-1 rounded cursor-pointer transition-colors group">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-white/10 transition-all">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-[#232428]"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-discord-muted leading-tight font-medium">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 relative" ref={settingsMenuRef}>
          <button 
            onClick={toggleMute}
            className={`p-1.5 rounded hover:bg-white/10 transition-all relative ${isMuted ? 'text-red-500' : 'text-discord-muted hover:text-discord-text'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleDeafen}
            className={`p-1.5 rounded hover:bg-white/10 transition-all relative ${isDeafened ? 'text-red-500' : 'text-discord-muted hover:text-discord-text'}`}
            title={isDeafened ? "Undeafen" : "Deafen"}
          >
            <Headphones className="w-5 h-5" />
            {isDeafened && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-[2px] bg-red-500 rotate-45 rounded-full shadow-lg" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-1.5 rounded hover:bg-white/10 transition-all ${showSettingsMenu ? 'text-white bg-white/10' : 'text-discord-muted hover:text-white'}`}
              title="User Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Settings Drop-up Menu */}
            {showSettingsMenu && (
              <div className="absolute bottom-10 right-0 w-48 bg-[#111214] rounded-md shadow-2xl border border-black/40 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1.5 border-b border-white/5 mb-1">
                  <p className="text-[10px] font-bold text-discord-muted uppercase tracking-wider">User Settings</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-colors group"
                >
                  <span className="font-medium">Log Out</span>
                  <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
