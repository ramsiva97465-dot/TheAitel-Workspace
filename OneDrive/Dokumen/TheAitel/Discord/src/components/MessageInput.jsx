import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Gift, StickyNote, Smile, SendHorizontal, Mic, FileUp, Hash, BarChart3, LayoutGrid, Loader2, X, FileIcon, ImageIcon } from 'lucide-react';
import { uploadFile } from '../services/storageService';

const MessageInput = ({ onSendMessage, roomName }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  const [threadName, setThreadName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const emojis = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '👀', '💯', '🙏', '🙌', '💡', '✅'];

  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };
  
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        if (transcript.includes('upload file') || transcript.includes('select file')) {
          fileInputRef.current?.click();
          setIsListening(false);
          return;
        }
        if (transcript.includes('create poll') || transcript.includes('start poll')) {
          setShowPollModal(true);
          setShowPlusMenu(false);
          setIsListening(false);
          return;
        }
        if (transcript.includes('create thread') || transcript.includes('start thread')) {
          setShowThreadModal(true);
          setShowPlusMenu(false);
          setIsListening(false);
          return;
        }
        if (transcript.includes('open menu')) {
          setShowPlusMenu(true);
          return;
        }

        setText(prev => (prev ? `${prev} ${transcript}` : transcript));
      };
      setRecognition(recog);
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleListening = () => {
    if (isListening) recognition?.stop();
    else recognition?.start();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowPlusMenu(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileData = await uploadFile(file, `rooms/${roomName || 'general'}/files`, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      onSendMessage('', fileData); 
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !isUploading) return;
    onSendMessage(text);
    setText('');
    if (isListening) recognition?.stop();
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!pollData.question || pollData.options.some(o => !o)) return;
    onSendMessage(`📊 POLL: ${pollData.question}`, {
      type: 'poll',
      question: pollData.question,
      options: pollData.options.map(o => ({ text: o, votes: 0 }))
    });
    setShowPollModal(false);
    setPollData({ question: '', options: ['', ''] });
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!threadName.trim()) return;
    onSendMessage(`🧵 THREAD: ${threadName}`, { type: 'thread', name: threadName });
    setShowThreadModal(false);
    setThreadName('');
  };

  return (
    <div className="p-4 shrink-0 relative">
      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1E1F22] w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-discord-header">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-discord-accent" />
                Create a Poll
              </h2>
              <button onClick={() => setShowPollModal(false)} className="text-discord-muted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePoll} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Question</label>
                <input 
                  required
                  className="w-full bg-[#383A40] border-none rounded p-3 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all"
                  placeholder="What should we name the project?"
                  value={pollData.question}
                  onChange={(e) => setPollData({...pollData, question: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-discord-muted uppercase">Options</label>
                {pollData.options.map((opt, idx) => (
                  <input 
                    key={idx}
                    required
                    className="w-full bg-[#383A40] border-none rounded p-3 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all text-sm"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollData.options];
                      newOpts[idx] = e.target.value;
                      setPollData({...pollData, options: newOpts});
                    }}
                  />
                ))}
                <button 
                  type="button"
                  onClick={() => setPollData({...pollData, options: [...pollData.options, '']})}
                  className="text-discord-accent text-xs font-bold hover:underline"
                >
                  + Add another option
                </button>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPollModal(false)} className="flex-1 py-3 rounded font-bold text-discord-text hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-discord-accent hover:bg-discord-accent/90 text-white rounded font-bold shadow-lg active:scale-95">Post Poll</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thread Modal */}
      {showThreadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1E1F22] w-full max-w-md rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-discord-header">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Hash className="text-discord-accent" />
                Create New Thread
              </h2>
              <button onClick={() => setShowThreadModal(false)} className="text-discord-muted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Thread Name</label>
                <input 
                  required
                  className="w-full bg-[#383A40] border-none rounded p-3 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all"
                  placeholder="e.g. Project Roadmap Discussions"
                  value={threadName}
                  onChange={(e) => setThreadName(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowThreadModal(false)} className="flex-1 py-3 rounded font-bold text-discord-text hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-discord-accent hover:bg-discord-accent/90 text-white rounded font-bold shadow-lg active:scale-95">Create Thread</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-x-4 top-[-20px] bg-discord-sidebar rounded-t-lg p-2 flex items-center gap-4 border border-white/5 shadow-lg z-10">
          <div className="flex-1 bg-black/20 h-2 rounded-full overflow-hidden">
            <div className="bg-discord-accent h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <span className="text-[10px] font-bold text-white uppercase">{uploadProgress}% Uploading...</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-12 right-4 bg-discord-accent text-white text-xs font-bold px-3 py-2 rounded shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
          {toastMessage}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 bg-[#2B2D31] border border-black/20 rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-64">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-discord-muted uppercase">Quick Emoji</span>
            <button type="button" onClick={() => setShowEmojiPicker(false)} className="text-discord-muted hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {emojis.map(emoji => (
              <button 
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="hover:bg-white/10 rounded p-1 text-xl transition-transform hover:scale-125 active:scale-95 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group relative transition-all duration-300 focus-within:bg-black/60 focus-within:border-discord-accent/50 focus-within:shadow-[0_8px_30px_rgba(59,130,246,0.15)]"
      >
        <div className="relative" ref={menuRef}>
          <button 
            type="button" 
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className="text-discord-muted hover:text-white transition-all hover:rotate-90 p-1"
          >
            <PlusCircle className={`w-6 h-6 transition-transform ${showPlusMenu ? 'rotate-45 text-discord-accent' : ''}`} />
          </button>

          {showPlusMenu && (
            <div className="absolute bottom-14 left-0 w-64 bg-[#0F1015] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-discord-accent/20 text-discord-muted hover:text-white transition-all group text-left"
              >
                <div className="bg-black/40 p-1.5 rounded-lg group-hover:bg-discord-accent/40 transition-colors">
                  <FileUp className="w-5 h-5 text-discord-accent group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Upload a File</span>
                  <span className="text-[9px] text-discord-accent uppercase font-bold tracking-wider">Voice: "Upload file"</span>
                </div>
              </button>
              
              <button 
                type="button"
                onClick={() => { setShowThreadModal(true); setShowPlusMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-discord-accent/20 text-discord-muted hover:text-white transition-all group text-left"
              >
                <div className="bg-black/40 p-1.5 rounded-lg group-hover:bg-discord-accent/40 transition-colors">
                  <Hash className="w-5 h-5 text-discord-accent group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Create Thread</span>
                  <span className="text-[9px] text-discord-accent uppercase font-bold tracking-wider">Voice: "Create thread"</span>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setShowPollModal(true); setShowPlusMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-discord-accent/20 text-discord-muted hover:text-white transition-all group text-left"
              >
                <div className="bg-black/40 p-1.5 rounded-lg group-hover:bg-discord-accent/40 transition-colors">
                  <BarChart3 className="w-5 h-5 text-discord-accent group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Create Poll</span>
                  <span className="text-[9px] text-discord-accent uppercase font-bold tracking-wider">Voice: "Create poll"</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        
        <input
          type="text"
          placeholder={`Message #${roomName || 'channel'}`}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-discord-muted/70 py-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center gap-2 text-discord-muted">
          <button 
            type="button"
            onClick={toggleListening}
            className={`transition-all duration-300 p-2 rounded-full relative z-10 ${
              isListening ? 'text-white bg-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Voice Type"
          >
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-60"></span>
                <span className="absolute -inset-2 rounded-full animate-pulse bg-blue-500/20"></span>
              </>
            )}
            <Mic className="w-5 h-5 relative z-10" />
          </button>
          
          {!text.trim() && !isUploading ? (
            <div className="hidden md:flex items-center gap-3">
              <button type="button" onClick={() => showToast('🎁 Gifts coming soon!')} className="hover:text-white transition-colors" title="Send a gift"><Gift className="w-6 h-6" /></button>
              <button type="button" onClick={() => showToast('📝 Stickers coming soon!')} className="hover:text-white transition-colors" title="Send a sticker"><StickyNote className="w-6 h-6" /></button>
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition-colors ${showEmojiPicker ? 'text-white scale-110' : 'hover:text-white'}`} title="Select emoji"><Smile className="w-6 h-6" /></button>
            </div>
          ) : (
            <button 
              type="submit" 
              disabled={isUploading} 
              className="transition-all text-discord-accent hover:text-white hover:scale-110 p-1"
              title="Send Message"
            >
              <SendHorizontal className="w-6 h-6" />
            </button>
          )}
        </div>

        {isListening && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg animate-bounce tracking-widest">
            Listening...
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
