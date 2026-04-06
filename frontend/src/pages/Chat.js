import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import axios from 'axios';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadChatWithUser(selectedUserId);
    }
  }, [selectedUserId]);

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
      
      // Find or create conversation partner data
      let partner = conversations.find(c => c.partner.id === userId)?.partner;
      if (!partner) {
        const { data: profileData } = await axios.get(`${API}/profiles/${userId}`, { withCredentials: true });
        partner = profileData;
      }
      setActiveChat(partner);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const { data } = await axios.post(
        `${API}/messages`,
        { receiver_id: activeChat.id, content: newMessage },
        { withCredentials: true }
      );
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/100?text=No+Photo';
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
    return `${API}/files/${path}?auth=${token}`;
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Messages
              </h2>
            </div>
            <ScrollArea className="h-[calc(100%-88px)]">
              {loading ? (
                <div className="p-4 text-center">
                  <p className="font-body" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="font-body" style={{ color: 'var(--text-secondary)' }}>No conversations yet</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => (
                    <div
                      key={conv.partner.id}
                      data-testid={`conversation-${conv.partner.id}`}
                      onClick={() => loadChatWithUser(conv.partner.id)}
                      className="p-4 flex items-center gap-4 cursor-pointer transition-smooth hover:bg-surface-secondary"
                      style={{
                        background: activeChat?.id === conv.partner.id ? 'var(--surface-secondary)' : 'transparent',
                      }}
                    >
                      <img
                        src={getImageUrl(conv.partner.profile_photo)}
                        alt={conv.partner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {conv.partner.name}
                        </p>
                        {conv.last_message && (
                          <p className="font-body text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                            {conv.last_message.content}
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
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl flex flex-col" style={{ border: '1px solid var(--border)' }}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                  <img
                    src={getImageUrl(activeChat.profile_photo)}
                    alt={activeChat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {activeChat.name}
                    </p>
                    <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {activeChat.city}, {activeChat.state}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        data-testid={`message-${msg.id}`}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-[70%] px-4 py-3 rounded-2xl font-body"
                          style={{
                            background: msg.sender_id === user?.id ? 'var(--primary)' : 'var(--surface-secondary)',
                            color: msg.sender_id === user?.id ? 'white' : 'var(--text-primary)',
                          }}
                        >
                          <p>{msg.content}</p>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: msg.sender_id === user?.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                            }}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex gap-3">
                    <Input
                      data-testid="message-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 h-12 font-body"
                    />
                    <Button
                      data-testid="send-message-button"
                      onClick={sendMessage}
                      className="h-12 px-6 rounded-full font-body text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-body text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;