import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import axios from 'axios';
import { ArrowLeft, Send, Lock, Check, CheckCheck, Pencil, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

// ── Relative time helper ──
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');

  // Core chat state
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Presence state
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});

  // Typing state
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const emitTypingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Edit/Delete state
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Refs for closures
  const activeChatRef = useRef(activeChat);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // ── Auto-scroll to bottom when messages change ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // ── Fetch conversations on mount ──
  useEffect(() => { fetchConversations(); }, []);

  // ── Load chat from URL param ──
  useEffect(() => {
    if (selectedUserId) loadChatWithUser(selectedUserId);
  }, [selectedUserId]);

  // ── Close context menu on click outside ──
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // ═══════════════════════════════════════════════════════
  // ── Socket.io Connection & Event Listeners ──
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!user?.id) return;

    const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const backendUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join', user.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    // ── Presence events ──
    socket.on('online_users_list', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('user_online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
    });

    // ── Typing events ──
    socket.on('user_typing', ({ userId }) => {
      const current = activeChatRef.current;
      if (current && userId === current.id) {
        setTypingUser(userId);
        // Auto-clear typing after 4 seconds (in case stop event is missed)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 4000);
      }
    });

    socket.on('user_stopped_typing', ({ userId }) => {
      const current = activeChatRef.current;
      if (current && userId === current.id) {
        setTypingUser(null);
      }
    });

    // ── New message ──
    socket.on('new_message', (msg) => {
      const current = activeChatRef.current;

      // Acknowledge delivery to the sender
      if (msg.sender_id !== user.id) {
        socket.emit('message_delivered', { messageId: msg.id });
      }

      if (current && (msg.sender_id === current.id || msg.receiver_id === current.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // If it's an incoming message and we're viewing this chat, mark as read
        if (msg.sender_id !== user.id) {
          socket.emit('messages_read', { senderId: msg.sender_id });
        }
      }
      fetchConversations();
    });

    // ── Message status updates (tick marks) ──
    socket.on('message_status', ({ id, status }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    });

    // ── Read receipts ──
    socket.on('messages_read_ack', ({ readerId }) => {
      const current = activeChatRef.current;
      if (current && readerId === current.id) {
        setMessages(prev => prev.map(m =>
          m.sender_id === user.id && m.status !== 'read'
            ? { ...m, status: 'read' }
            : m
        ));
      }
    });

    // ── Message edited ──
    socket.on('message_edited', ({ id, content, edited_at }) => {
      setMessages(prev => prev.map(m =>
        m.id === id ? { ...m, content, edited: true, edited_at } : m
      ));
    });

    // ── Message deleted ──
    socket.on('message_deleted', ({ id }) => {
      setMessages(prev => prev.map(m =>
        m.id === id ? { ...m, deleted: true, content: '' } : m
      ));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  // ── Emit read receipts when active chat changes ──
  useEffect(() => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit('messages_read', { senderId: activeChat.id });
    }
  }, [activeChat]);

  // ═══════════════════════════════════════════════════════
  // ── Data Fetching ──
  // ═══════════════════════════════════════════════════════
  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/conversations`, { withCredentials: true });
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatWithUser = async (userId) => {
    try {
      const { data } = await axios.get(`${API}/messages/${userId}`, { withCredentials: true });
      setMessages(data);

      let partner = conversations.find(c => c.partner.id === userId)?.partner;
      let isMutual = conversations.find(c => c.partner.id === userId)?.is_mutual_match;

      const { data: profileData } = await axios.get(`${API}/profiles/${userId}`, { withCredentials: true });
      partner = profileData;
      isMutual = profileData.is_mutual_match;

      setActiveChat({ ...partner, is_mutual_match: isMutual });
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleUnmatch = async () => {
    if (!activeChat) return;
    if (confirm(`Are you sure you want to unmatch with ${activeChat.name}?`)) {
      try {
        await axios.post(`${API}/match/unlike`, { target_id: activeChat.id }, { withCredentials: true });
        toast.success(`Unmatched with ${activeChat.name}`);
        setShowMenu(false);
        setActiveChat(null);
        fetchConversations();
        navigate('/chat');
      } catch (err) {
        toast.error("Failed to unmatch");
      }
    }
  };

  const handleBlock = async () => {
    if (!activeChat) return;
    if (confirm(`Are you sure you want to block ${activeChat.name}?`)) {
      try {
        await axios.post(`${API}/match/block`, { target_id: activeChat.id }, { withCredentials: true });
        toast.success(`Blocked ${activeChat.name}`);
        setShowMenu(false);
        setActiveChat(null);
        fetchConversations();
        navigate('/chat');
      } catch (err) {
        toast.error("Failed to block user");
      }
    }
  };

  // ═══════════════════════════════════════════════════════
  // ── Message Actions ──
  // ═══════════════════════════════════════════════════════
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    // If we're in edit mode, update instead of sending new
    if (editingMessage) {
      return saveEdit();
    }

    try {
      const { data } = await axios.post(
        `${API}/messages`,
        { receiver_id: activeChat.id, content: newMessage },
        { withCredentials: true }
      );
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewMessage('');
      stopTypingEmit();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const startEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
    setContextMenu(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const saveEdit = async () => {
    if (!editingMessage || !newMessage.trim()) return;
    try {
      await axios.put(
        `${API}/messages/${editingMessage.id}`,
        { content: newMessage },
        { withCredentials: true }
      );
      // The socket event will update the message in state
      setEditingMessage(null);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const deleteMsg = async (msgId) => {
    try {
      await axios.delete(`${API}/messages/${msgId}`, { withCredentials: true });
      // The socket event will update the message in state
      setContextMenu(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  // ═══════════════════════════════════════════════════════
  // ── Typing Indicator Emission ──
  // ═══════════════════════════════════════════════════════
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!activeChat || !socketRef.current) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('typing_start', { receiverId: activeChat.id });
    }

    // Reset the stop-typing timer
    if (emitTypingTimeoutRef.current) clearTimeout(emitTypingTimeoutRef.current);
    emitTypingTimeoutRef.current = setTimeout(() => {
      stopTypingEmit();
    }, 2000);
  };

  const stopTypingEmit = () => {
    if (isTypingRef.current && socketRef.current && activeChatRef.current) {
      socketRef.current.emit('typing_stop', { receiverId: activeChatRef.current.id });
      isTypingRef.current = false;
    }
    if (emitTypingTimeoutRef.current) clearTimeout(emitTypingTimeoutRef.current);
  };

  // ═══════════════════════════════════════════════════════
  // ── Context Menu (Right-click / Long-press) ──
  // ═══════════════════════════════════════════════════════
  const longPressTimerRef = useRef(null);

  const handleContextMenu = (e, msg) => {
    if (msg.sender_id !== user?.id || msg.deleted) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
  };

  const handleTouchStart = (msg) => {
    if (msg.sender_id !== user?.id || msg.deleted) return;
    longPressTimerRef.current = setTimeout(() => {
      // For mobile, position the menu near the center
      setContextMenu({ x: window.innerWidth / 2, y: window.innerHeight / 2, message: msg });
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  // ═══════════════════════════════════════════════════════
  // ── Helper: Image URL ──
  // ═══════════════════════════════════════════════════════
  const getImageUrl = (photoPath) => {
    if (!photoPath) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0e8f0'/%3E%3Ccircle cx='50' cy='38' r='22' fill='%23c9a0c9'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='28' fill='%23c9a0c9'/%3E%3C/svg%3E`;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
    return `${API}/files/${photoPath}?auth=${token}`;
  };

  // ═══════════════════════════════════════════════════════
  // ── Status Tick Component ──
  // ═══════════════════════════════════════════════════════
  const StatusTicks = ({ status, isSender }) => {
    if (!isSender) return null;

    const baseStyle = { marginLeft: '4px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' };

    if (status === 'read') {
      return (
        <span style={baseStyle} title="Read">
          <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53BDEB' }} />
        </span>
      );
    }
    if (status === 'delivered') {
      return (
        <span style={baseStyle} title="Delivered">
          <CheckCheck className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
        </span>
      );
    }
    // 'sent' or default
    return (
      <span style={baseStyle} title="Sent">
        <Check className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════
  // ── Presence subtitle ──
  // ═══════════════════════════════════════════════════════
  const getPresenceText = () => {
    if (!activeChat) return '';
    if (typingUser === activeChat.id) return null; // handled by typing indicator
    if (onlineUsers.has(activeChat.id)) return 'Online';
    const ls = lastSeenMap[activeChat.id];
    if (ls) return `Last seen ${timeAgo(ls)}`;
    return `${activeChat.city || ''}, ${activeChat.state || ''}`;
  };

  // ═══════════════════════════════════════════════════════
  // ── RENDER ──
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] lg:h-[calc(100vh-180px)]">
          {/* ────────────────── Conversations List ────────────────── */}
          <div className={`lg:col-span-1 bg-white rounded-2xl overflow-hidden flex flex-col ${activeChat ? 'hidden lg:flex' : 'flex'}`} style={{ border: '1px solid var(--border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('chat.title') || 'Messages'}
              </h2>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center">
                  <p className="font-body" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="font-body" style={{ color: 'var(--text-secondary)' }}>No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {conversations.map((conv) => {
                    const isOnline = onlineUsers.has(conv.partner.id) || conv.partner.is_online;
                    const lastMsg = conv.last_message;
                    let lastMsgPreview = lastMsg?.content || '';
                    if (lastMsg?.deleted) lastMsgPreview = '🚫 This message was deleted';

                    return (
                      <div
                        key={conv.partner.id}
                        data-testid={`conversation-${conv.partner.id}`}
                        onClick={() => loadChatWithUser(conv.partner.id)}
                        className="p-4 flex items-center gap-4 cursor-pointer transition-smooth hover:bg-surface-secondary"
                        style={{
                          background: activeChat?.id === conv.partner.id ? 'var(--surface-secondary)' : 'transparent',
                        }}
                      >
                        {/* Avatar with online indicator */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={getImageUrl(conv.partner.profile_photo)}
                            alt={conv.partner.name}
                            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${conv.partner.id}`);
                            }}
                          />
                          {isOnline && (
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                              style={{ background: '#22C55E' }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {conv.partner.name}
                          </p>
                          {lastMsg && (
                            <p className="font-body text-sm truncate" style={{ color: lastMsg?.deleted ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>
                              {lastMsgPreview}
                            </p>
                          )}
                        </div>
                        {conv.unread_count > 0 && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-body font-bold text-white"
                            style={{ background: 'var(--primary)' }}
                          >
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ────────────────── Chat Area ────────────────── */}
          <div className={`lg:col-span-2 bg-white rounded-2xl flex flex-col ${activeChat ? 'flex' : 'hidden lg:flex'}`} style={{ border: '1px solid var(--border)' }}>
            {activeChat ? (
              <>
                {/* ── Chat Header with Presence ── */}
                <div className="p-4 sm:p-6 border-b flex items-center gap-3 sm:gap-4" style={{ borderColor: 'var(--border)' }}>
                  <Button
                    onClick={() => { setActiveChat(null); navigate('/chat'); }}
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full h-10 w-10 flex-shrink-0"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>

                  {/* Avatar with online dot */}
                  <div 
                    className="relative flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => navigate(`/profile/${activeChat.id}`)}
                  >
                    <img
                      src={getImageUrl(activeChat.profile_photo)}
                      alt={activeChat.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    {onlineUsers.has(activeChat.id) && (
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: '#22C55E' }}
                      />
                    )}
                  </div>

                  <div 
                    className="min-w-0 cursor-pointer flex-1"
                    onClick={() => navigate(`/profile/${activeChat.id}`)}
                  >
                    <p className="font-heading text-lg sm:text-xl font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {activeChat.name}
                    </p>
                    {/* Dynamic presence subtitle */}
                    {typingUser === activeChat.id ? (
                      <p className="font-body text-xs sm:text-sm" style={{ color: '#22C55E' }}>
                        typing
                        <span className="typing-dots">
                          <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                        </span>
                      </p>
                    ) : (
                      <p className="font-body text-xs sm:text-sm truncate" style={{
                        color: onlineUsers.has(activeChat.id) ? '#22C55E' : 'var(--text-secondary)'
                      }}>
                        {getPresenceText()}
                      </p>
                    )}
                  </div>

                  {/* Three-dot menu button */}
                  <div className="relative">
                    <Button
                      onClick={() => setShowMenu(!showMenu)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </Button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            navigate(`/profile/${activeChat.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-gray-50 text-gray-700"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={handleUnmatch}
                          className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-gray-50 text-red-500 font-semibold"
                        >
                          Unmatch
                        </button>
                        <button
                          onClick={handleBlock}
                          className="w-full text-left px-4 py-2.5 text-sm font-body hover:bg-red-50 text-red-600 font-semibold"
                        >
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Messages ── */}
                <ScrollArea className="flex-1 p-4 sm:p-6">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isSender = msg.sender_id === user?.id;

                      return (
                        <div
                          key={msg.id}
                          data-testid={`message-${msg.id}`}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          onContextMenu={(e) => handleContextMenu(e, msg)}
                          onTouchStart={() => handleTouchStart(msg)}
                          onTouchEnd={handleTouchEnd}
                          onTouchMove={handleTouchEnd}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl font-body relative group ${isSender ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
                            style={{
                              background: msg.deleted
                                ? (isSender ? 'rgba(200,75,49,0.3)' : 'var(--surface-secondary)')
                                : (isSender ? 'var(--primary)' : 'var(--surface-secondary)'),
                              color: msg.deleted
                                ? 'var(--text-secondary)'
                                : (isSender ? 'white' : 'var(--text-primary)'),
                            }}
                          >
                            {msg.deleted ? (
                              <p className="break-words italic text-sm">🚫 This message was deleted</p>
                            ) : (
                              <>
                                <p className="break-words">{msg.content}</p>
                                {msg.edited && (
                                  <span
                                    className="text-[10px] italic mr-1"
                                    style={{ color: isSender ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}
                                  >
                                    edited
                                  </span>
                                )}
                              </>
                            )}
                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                              <span
                                className="text-[10px]"
                                style={{
                                  color: msg.deleted
                                    ? 'var(--text-secondary)'
                                    : (isSender ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'),
                                }}
                              >
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!msg.deleted && <StatusTicks status={msg.status} isSender={isSender} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* ── Typing indicator bubble ── */}
                    {typingUser && typingUser === activeChat?.id && (
                      <div className="flex justify-start">
                        <div
                          className="px-4 py-3 rounded-2xl font-body"
                          style={{ background: 'var(--surface-secondary)' }}
                        >
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* ── Message Input ── */}
                <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  {activeChat.is_mutual_match ? (
                    <>
                      {/* Edit mode banner */}
                      {editingMessage && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                          <Pencil className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          <span className="font-body text-sm flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                            Editing message
                          </span>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded-full hover:bg-white/50 transition-colors"
                          >
                            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 sm:gap-3">
                        <Input
                          data-testid="message-input"
                          value={newMessage}
                          onChange={handleInputChange}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder={editingMessage ? 'Edit your message...' : 'Type a message...'}
                          className="flex-1 h-12 font-body text-sm sm:text-base"
                        />
                        <Button
                          data-testid="send-message-button"
                          onClick={sendMessage}
                          className="h-12 w-12 sm:w-auto sm:px-6 rounded-full font-body text-white flex items-center justify-center flex-shrink-0"
                          style={{ background: editingMessage ? '#22C55E' : 'var(--primary)' }}
                        >
                          {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-pink-50 border border-pink-200">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-pink-500 flex-shrink-0" />
                        <p className="font-body text-sm text-pink-800">
                          You can only message users you have mutually matched with. Like {activeChat.name} to connect!
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/profile/${activeChat.id}`)}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-body text-xs rounded-full h-8 px-4 flex-shrink-0 w-full sm:w-auto"
                      >
                        View Profile to Like
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <p className="font-body text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────── Context Menu (Edit/Delete) ────────────────── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-2xl border overflow-hidden"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 180),
            top: Math.min(contextMenu.y, window.innerHeight - 120),
            borderColor: 'var(--border)',
            minWidth: '160px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => startEdit(contextMenu.message)}
          >
            <Pencil className="w-4 h-4" />
            Edit message
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 font-body text-sm hover:bg-red-50 transition-colors"
            style={{ color: 'var(--error)' }}
            onClick={() => deleteMsg(contextMenu.message.id)}
          >
            <Trash2 className="w-4 h-4" />
            Delete for everyone
          </button>
        </div>
      )}

      {/* ────────────────── Inline Styles for Animations ────────────────── */}
      <style>{`
        /* Typing dots animation in header */
        .typing-dots .dot {
          animation: typingHeaderDots 1.4s infinite;
          font-weight: bold;
        }
        .typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingHeaderDots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Typing indicator bubble */
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
          align-items: center;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: typingBounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Context menu appear animation */
        .fixed.z-50 {
          animation: contextMenuAppear 0.15s ease-out;
        }
        @keyframes contextMenuAppear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Chat;
