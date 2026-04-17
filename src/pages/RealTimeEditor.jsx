import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // assuming router setup

const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

export default function RealTimeEditor() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || 'default-room';
  const [documentContent, setDocumentContent] = useState('');
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const editorRef = useRef(null);
  const channelRef = useRef(null);
  const debounceRef = useRef(null);

  // BroadcastChannel for real-time (multi-tab)
  useEffect(() => {
    channelRef.current = new BroadcastChannel(`doc-${roomId}`);
    
    // Join room
    const joinMsg = { type: 'user-join', user: userName, color: colors[Math.floor(Math.random() * colors.length)] };
    channelRef.current.postMessage(joinMsg);
    setIsConnected(true);

    // Listen for messages
    channelRef.current.onmessage = (event) => {
      const msg = event.data;
      switch (msg.type) {
        case 'user-join':
          setUsers(prev => {
            if (!prev.find(u => u.name === msg.user)) {
              return [...prev, msg];
            }
            return prev;
          });
          break;
        case 'user-leave':
          setUsers(prev => prev.filter(u => u.name !== msg.user));
          break;
        case 'document-change':
          setDocumentContent(msg.content);
          break;
        case 'cursor-position':
          // Update cursors (handled in component)
          break;
        case 'typing':
          setTypingUsers(prev => new Set([...prev, msg.user]));
          break;
        case 'typing-stop':
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(msg.user);
            return newSet;
          });
          break;
      }
    };

    return () => {
      channelRef.current.close();
      channelRef.current.postMessage({ type: 'user-leave', user: userName });
    };
  }, [roomId, userName]);

  // localStorage fallback
  useEffect(() => {
    const saved = localStorage.getItem(`doc-${roomId}`);
    if (saved) setDocumentContent(saved);
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(`doc-${roomId}`, documentContent);
  }, [documentContent, roomId]);

  // Debounced change broadcast
  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setDocumentContent(newContent);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      channelRef.current?.postMessage({
        type: 'document-change',
        content: newContent
      });
    }, 300);
  }, []);

  // Typing indicator
  const handleKeyDown = () => {
    channelRef.current?.postMessage({ type: 'typing', user: userName });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      channelRef.current?.postMessage({ type: 'typing-stop', user: userName });
    }, 2000);
  };

  // Cursor position (simplified)
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      // Could broadcast cursor pos here
    }
  };

  const typingText = Array.from(typingUsers).map(u => u).join(', ') || '';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <input
            value={documentContent.slice(0, 100) || 'Untitled document'}
            onChange={(e) => {}} // title editable
            className="font-sans text-xl font-semibold text-gray-900 outline-none max-w-md"
            placeholder="Untitled document"
          />
          <div className="flex items-center gap-1">
            {users.map((user) => (
              <div
                key={user.name}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-3 py-1 rounded-full font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
          <span className="text-gray-500">
            {typingText ? `${typingText} is typing...` : ''}
          </span>
          <span className="text-gray-500">Auto-saved</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 p-12 font-serif text-lg leading-relaxed text-gray-900 outline-none"
          contentEditable
          suppressContentEditableWarning
          ref={editorRef}
          onInput={handleChange}
          onKeyDown={handleKeyDown}
          onSelectionChange={handleSelectionChange}
        >
          {documentContent}
        </div>
        
        {/* Live Cursors - simplified overlay */}
        {users.map((user) => (
          <div
            key={user.name}
            className="absolute w-1 bg-[user.color] h-8 opacity-70 pointer-events-none z-10"
            style={{ 
              left: '50%', // simulate
              top: '50%',
              backgroundColor: user.color
            }}
            title={`${user.name}'s cursor`}
          />
        ))}
      </div>

      {/* User List Sidebar (optional) */}
      <div className="w-64 bg-white border-l border-gray-200 p-6 hidden lg:block">
        <h3 className="font-semibold mb-4">Present users</h3>
        {users.map((user) => (
          <div key={user.name} className="flex items-center gap-3 py-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Editing...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

