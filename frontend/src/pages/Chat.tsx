import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, Clock } from 'lucide-react';
import './Chat.css';

interface ChatItem {
  id: number;
  recipient_username: string;
  last_message_text: string;
  last_message_time: string | null;
}

interface Message {
  id: number;
  text: string;
  is_mine: boolean;
  created_at: string;
}

const ChatDashboard = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await axios.get('http://127.0.0.1:8000/products/chat-list/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(res.data);
      } catch (e) {
        console.error("Chatlarni yuklashda xatolik:", e);
      }
    };
    fetchChats();
  }, []);

  // Set up WebSocket to receive messages dynamically here or rely on NotificationProvider's toast
  // Since we want dynamic append, let's poll or rely on a global event listener, 
  // currently we just do a simple fetch
  useEffect(() => {
    if (!activeChatId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await axios.get(`http://127.0.0.1:8000/products/chat-detail/${activeChatId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (e) {
        console.error("Xabarlarni yuklashda xatolik:", e);
      }
    };
    fetchMessages();
    
    // Yengil vaqtinchalik yechim: Websockets o'rniga polling (faqat ushbu test uchun):
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    
    try {
      const token = localStorage.getItem('access');
      const res = await axios.post(`http://127.0.0.1:8000/products/chat-detail/${activeChatId}/`, {
        text: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Append local
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (e) {
      console.error("Jo'natishda xatolik:", e);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="chat-dashboard container mt-4">
      <div className="chat-container glass-panel">
        
        {/* Left Sidebar - Chat List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Xabarlar</h3>
          </div>
          <div className="chat-list">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="chat-avatar">
                   <UserIcon size={20} />
                </div>
                <div className="chat-info">
                  <h4>{chat.recipient_username}</h4>
                  <p>{chat.last_message_text.substring(0, 30)}...</p>
                </div>
              </div>
            ))}
            {chats.length === 0 && <p className="text-secondary p-3">Hech qanday muloqot yo'q</p>}
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className="chat-window">
          {activeChatId ? (
            <>
              <div className="chat-window-header">
                <div className="chat-avatar">
                  <UserIcon size={20} />
                </div>
                <h4>{activeChat?.recipient_username}</h4>
              </div>
              
              <div className="message-list">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-wrapper ${msg.is_mine ? 'mine' : 'theirs'}`}>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        <Clock size={10} style={{ marginRight: '4px' }}/> {msg.created_at}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <form onSubmit={sendMessage} className="chat-form">
                  <input 
                    type="text" 
                    placeholder="Xabar yozing..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary send-btn">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <UserIcon size={48} className="text-secondary mb-3"/>
              <h3>Suhbatni boshlang</h3>
              <p>Chap tomondan kim bilandir muloqotni tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
