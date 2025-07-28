import React, { useState, useRef, useEffect } from 'react';
import { Send, Users } from 'lucide-react';
import './dashboard.css'

const GroupChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(''); // Add current user name
  const [users, setUsers] = useState([]); // Changed from onlineUsers to users
  const [onlineUsers, setOnlineUsers] = useState([]); // Keep for actual online status

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to get user details by ID from actual users data
  const getUserById = (userId) => {
    const user = users.find(user => user.id === userId);
    if (user) {
      return {
        id: user.id,
        name: user.fullName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`,
        status: onlineUsers.includes(userId) ? 'online' : 'offline'
      };
    }
    
    // Fallback for unknown users
    return {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${userId}`,
      status: 'unknown'
    };
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
      
      // Refresh messages after sending
      await allMessages();
      
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

  const allMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/user-message', {
        method: "GET",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Error in all messages in Dashboard");
        return;
      }

      // Set current user ID from response
      if (data.id && !currentUserId) {
        setCurrentUserId(data.id);
        
        // Set current user name
        const currentUser = data.users?.find(user => user.id === data.id);
        if (currentUser) {
          setCurrentUserName(currentUser.fullName);
        }
      }

      // Set users from the response
      if (data.users) {
        setUsers(data.users);
      }

      // Process messages to add user details and format properly
      const processedMessages = data.messages.map((message, index) => {
        const user = getUserById(message.userId);
        const isOwn = message.userId === data.id;
        
        return {
          id: message.id || index, // Use message ID if available, otherwise use index
          message: message.userMessage,
          user: user.name,
          userId: message.userId,
          avatar: user.avatar,
          timestamp: formatTimestamp(message.createdAt),
          isOwn: isOwn
        };
      });

      setMessages(processedMessages);
    } catch (error) {
      console.log('Server error while fetching all messages in dashboard', error.message);
    }
  };

  // Get unique users who have sent messages
  const getActiveUsers = () => {
    const uniqueUserIds = [...new Set(messages.map(msg => msg.userId))];
    return uniqueUserIds.map(userId => getUserById(userId));
  };

  useEffect(() => {
  allMessages();
}, []);

  useEffect(() => {
  const intervalId = setInterval(() => {
    allMessages();
  }, 1000); // Fetch messages every 1 second

  // Clear interval on component unmount
  return () => clearInterval(intervalId);
}, []);

  const activeUsers = getActiveUsers();

  return (
    <div className="chat-dashboard">
      {/* Header */}
      <div className="chat-header">
        <h1>Chat Hub</h1>
        <div className="user-info">
        <p>{activeUsers.length} active users • {onlineUsers.length} online</p>
          {currentUserName && <span className="current-user">Welcome, {currentUserName}</span>}
          
        </div>
      </div>

      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h3 className="online-user">Active Users</h3>
          <div className="users-list">
            {activeUsers.map(user => (
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
            {error && <div className="error-message">{error}</div>}
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