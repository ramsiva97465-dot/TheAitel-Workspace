import React, { useState, useEffect } from 'react';
import { Shield, Ban } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ChatDashboard = () => {
  const { user } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeRoomName, setActiveRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch active room name when ID changes
  useEffect(() => {
    if (!activeRoomId) return;
    
    // In a real app, we might get this from the rooms list
    // For now, we'll just set a loading state or fetch it
    const fetchRoomName = async () => {
      const { doc, getDoc } = await import('firebase/firestore');
      const roomDoc = await getDoc(doc(db, 'rooms', activeRoomId));
      if (roomDoc.exists()) {
        setActiveRoomName(roomDoc.data().name);
      }
    };
    fetchRoomName();
  }, [activeRoomId]);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', activeRoomId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  const handleSendMessage = async (text, fileData = null) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        roomId: activeRoomId,
        text,
        file: fileData, // Store file info if present
        senderUid: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || '',
        senderPhotoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[85%] h-full bg-[#060B14]/90 backdrop-blur-3xl flex-shrink-0 shadow-2xl animate-in slide-in-from-left-8 duration-300 border-r border-white/10">
            <Sidebar 
              activeRoomId={activeRoomId} 
              onRoomSelect={(id) => { setActiveRoomId(id); setIsMobileMenuOpen(false); }} 
            />
          </div>
        </div>
      )}

      {/* Sidebar - hidden on mobile if needed, but for now standard */}
      <div className="hidden md:block h-full backdrop-blur-3xl bg-discord-sidebar/60 border-r border-white/5 shadow-2xl relative z-20">
        <Sidebar 
          activeRoomId={activeRoomId} 
          onRoomSelect={setActiveRoomId} 
        />
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-discord-chat/40 backdrop-blur-2xl relative z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
        {user?.status === 'blocked' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-discord-chat">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-xl border border-red-500/20">
              <Ban className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-discord-muted max-w-md text-lg leading-relaxed">
              Your account has been <span className="text-red-500 font-bold uppercase">blocked</span> by an administrator. 
              Please contact the support team if you believe this is a mistake.
            </p>
            <div className="mt-8 p-4 bg-discord-sidebar/50 rounded-lg border border-white/5">
              <p className="text-xs text-discord-muted uppercase tracking-widest">Account: {user.email}</p>
            </div>
          </div>
        ) : user?.role === 'unassigned' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-discord-chat">
            <div className="w-24 h-24 bg-discord-sidebar rounded-full flex items-center justify-center mb-6 shadow-xl">
              <Shield className="w-12 h-12 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Verification Pending</h2>
            <p className="text-discord-muted max-w-md text-lg leading-relaxed">
              Welcome, <span className="text-discord-accent font-bold">{user.displayName || user.email}</span>! 
              Your account is currently <span className="text-yellow-500 font-bold">unassigned</span>. 
              Please wait for an administrator to assign your role before you can access the chat rooms.
            </p>
            <div className="mt-8 p-4 bg-discord-sidebar/50 rounded-lg border border-white/5">
              <p className="text-xs text-discord-muted uppercase tracking-widest">Logged in as: {user.email}</p>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader roomName={activeRoomName} onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <MessageList messages={messages} loading={loading} />
            
            <MessageInput 
              onSendMessage={handleSendMessage} 
              roomName={activeRoomName} 
            />
          </>
        )}
      </div>

      {/* Right Sidebar Placeholder (Discord style) */}
      <div className="hidden lg:block w-60 bg-discord-header border-l border-black/20 p-4">
        <h3 className="text-xs font-bold text-discord-muted uppercase tracking-wider mb-4 px-2">Online — 1</h3>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-discord-hover transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white relative overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#2B2D31]"></div>
          </div>
          <span className="text-discord-muted group-hover:text-discord-text font-medium text-sm truncate">
            {user?.displayName || user?.email?.split('@')[0] || 'You'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
