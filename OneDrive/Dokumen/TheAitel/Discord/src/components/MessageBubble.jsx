import React from 'react';
import { User, FileIcon, Download, ImageIcon, FileText, FileArchive, Reply, SmilePlus, Share, MoreHorizontal } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const formattedTime = message.createdAt?.toDate 
    ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '...';

  const formattedDate = message.createdAt?.toDate
    ? message.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const nameColors = [
    'text-blue-400',
    'text-purple-400',
    'text-emerald-400',
    'text-amber-400',
    'text-pink-400',
    'text-cyan-400',
    'text-rose-400'
  ];

  const getColorClass = (str) => {
    if (!str) return 'text-white';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % nameColors.length;
    return nameColors[index];
  };

  const senderDisplayName = message.senderName || message.senderEmail?.split('@')[0] || 'User';
  const nameColorClass = getColorClass(message.senderEmail || message.senderName);

  const renderFile = () => {
    if (!message.file) return null;

    const { url, name, type, size } = message.file;
    const isImage = type.startsWith('image/');
    const formattedSize = (size / 1024 / 1024).toFixed(2) + ' MB';

    if (isImage) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border-2 border-transparent hover:border-discord-accent/50 max-w-sm group/img relative transition-colors shadow-lg">
          <img src={url} alt={name} className="max-h-[300px] object-cover cursor-pointer hover:opacity-80 transition-opacity" />
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/70 backdrop-blur p-2 rounded-md opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 text-white"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      );
    }

    return (
      <div className="mt-2 bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5 flex items-center gap-4 max-w-sm hover:bg-black/50 hover:border-discord-accent/30 transition-all cursor-pointer group/file shadow-lg">
        <div className="bg-gradient-to-br from-discord-accent/20 to-transparent p-2.5 rounded-lg border border-white/5">
          {type.includes('pdf') ? <FileText className="w-8 h-8 text-red-400" /> : 
           type.includes('zip') ? <FileArchive className="w-8 h-8 text-yellow-400" /> :
           <FileIcon className="w-8 h-8 text-discord-accent" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{name}</p>
          <p className="text-[10px] text-discord-muted uppercase tracking-wider font-semibold">{formattedSize}</p>
        </div>
        <a 
          href={url} 
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-white/5 hover:bg-discord-accent rounded-lg transition-all text-discord-muted hover:text-white hover:scale-105"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    );
  };

  return (
    <div className="flex gap-4 px-4 py-2 hover:bg-white/5 group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Quick Action Hover Menu */}
      <div className="absolute -top-4 right-4 bg-discord-header/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center overflow-hidden z-10">
        <button className="p-2 hover:bg-discord-hover text-discord-muted hover:text-discord-accent transition-colors active:scale-95" title="Add Reaction"><SmilePlus className="w-[18px] h-[18px]" /></button>
        <button className="p-2 hover:bg-discord-hover text-discord-muted hover:text-white transition-colors active:scale-95" title="Reply"><Reply className="w-[18px] h-[18px]" /></button>
        <button className="p-2 hover:bg-discord-hover text-discord-muted hover:text-white transition-colors active:scale-95" title="Share"><Share className="w-[18px] h-[18px]" /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
        <button className="p-2 hover:bg-discord-hover text-discord-muted hover:text-red-400 transition-colors active:scale-95" title="More Options"><MoreHorizontal className="w-[18px] h-[18px]" /></button>
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-discord-accent to-purple-500 shrink-0 flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-transparent group-hover:ring-discord-accent/50 transition-all">
        {message.senderPhotoURL ? (
          <img src={message.senderPhotoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`font-extrabold ${nameColorClass} hover:brightness-125 hover:underline cursor-pointer transition-all tracking-wide`}>
            {senderDisplayName}
          </span>
          <span className="text-[10px] text-discord-muted font-medium">
            {formattedDate} {formattedTime}
          </span>
        </div>
        {message.text && (
          <p className="text-white/90 leading-relaxed break-words mt-0.5">
            {message.text}
          </p>
        )}
        {renderFile()}
      </div>
    </div>
  );
};

export default MessageBubble;
