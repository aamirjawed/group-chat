import React, { useState, useRef, useEffect } from 'react';
import { Send, Users } from 'lucide-react';
import './dashboard.css'

const GroupChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [onlineUsers] = useState([
    { id: 1, name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', status: 'online' },
    { id: 2, name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', status: 'online' },
    { id: 3, name: 'Carol Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', status: 'away' },
    { id: 4, name: 'David Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', status: 'offline' },
    { id: 5, name: 'Emma Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', status: 'online' }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    console.log("Document cookies:", document.cookie);

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/v1/user-message', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ userMessage: newMessage.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      
      // Clear the input on success
      setNewMessage("");
      
      // Optional: Show success feedback
      console.log('Message sent successfully:', data);
      
    } catch (error) {
      console.error('Failed to send message:', error.message);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-dashboard">
      {/* Header */}
      <div className="chat-header">
        <h1>Chat Hub</h1>
        <p>{onlineUsers.length} users online</p>
      </div>

      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h3 className="online-user">Online Users</h3>
          <div className="users-list">
            {onlineUsers.map(user => (
              <div key={user.id} className="user-item">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <span className={`user-status ${user.status}`}>{user.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="messages-container">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.isOwn ? 'my-message' : 'other-message'}`}>
                {!message.isOwn && (
                  <img src={message.avatar} alt={message.user} className="message-avatar" />
                )}
                <div className="message-content">
                  {!message.isOwn && <div className="message-sender">{message.user}</div>}
                  <div className="message-bubble">
                    {message.message}
                  </div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-area">
            {error && <div className="error-message" style={{color: 'red', fontSize: '14px', marginBottom: '8px'}}>{error}</div>}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="message-input"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              className="send-button"
              disabled={isLoading || !newMessage.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatDashboard;