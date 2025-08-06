import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Send, Users, AlertCircle, MessageSquare, Plus, X, Edit2, Save, Link, UserPlus, UserMinus, Shield, LogOut, Copy, Check } from 'lucide-react';
import './dashboard.css';

const GroupChatDashboard = () => {
  const navigate = useNavigate();

  // All the state variables
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  // Create group modal states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [createGroupLoading, setCreateGroupLoading] = useState(false);

  // Edit group modal states
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupLoading, setEditGroupLoading] = useState(false);

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Member management states
  const [showMemberActions, setShowMemberActions] = useState({});
  const [memberActionLoading, setMemberActionLoading] = useState({});

  // Join group states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinToken, setJoinToken] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  // Logout state
  const [logoutLoading, setLogoutLoading] = useState(false);

  const messagesEnd = useRef(null);

  // Scroll to bottom function
  const scrollDown = () => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if user needs to login
  const handleAuthRedirect = (status) => {
    if (status === 401 || status === 403) {
      navigate('/login');
      return true;
    }
    return false;
  };

  // API call function for main routes
  const apiFetch = async (path, options = {}) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });

      if (handleAuthRedirect(response.status)) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // API call function for auth routes
  const authApiFetch = async (path, options = {}) => {
    try {
      const response = await fetch(`http://localhost:5000${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });

      if (handleAuthRedirect(response.status)) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) {
      return;
    }
    
    setLogoutLoading(true);
    setError('');
    
    try {
      const data = await authApiFetch('/user/logout', {
        method: 'POST'
      });
      
      if (data && data.success) {
        setUser(null);
        setGroups([]);
        setCurrentGroupId(null);
        setMessages([]);
        setMembers([]);
        setGroup(null);
        navigate('/login');
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to logout');
        }
      }
    } catch (err) {
      setError('Failed to logout. Please try again.');
      console.error('Logout error:', err);
    }
    
    setLogoutLoading(false);
  };

  // Get all groups function
  const getGroups = async () => {
    setGroupsLoading(true);
    setError('');
    
    try {
      const data = await apiFetch('/get-groups', { method: 'GET' });
      
      if (data && data.success) {
        if (data.groups) {
          setGroups(data.groups);
        } else {
          setGroups([]);
        }
        
        if (data.groups && data.groups.length > 0 && !currentGroupId) {
          setCurrentGroupId(data.groups[0].id);
        }
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to fetch groups');
        }
      }
    } catch (err) {
      setError(err.message);
    }
    
    setGroupsLoading(false);
  };

  // Test auth function
  const testAuth = async () => {
    try {
      const data = await apiFetch('/auth/check', { method: 'GET' });
      if (data) {
        setDebugInfo(debugInfo + `\nAuth: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setDebugInfo(debugInfo + `\nAuth failed: ${err.message}`);
    }
  };

  // Create new group function
  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    
    setCreateGroupLoading(true);
    setError('');
    
    try {
      const requestBody = {
        groupName: newGroupName.trim(),
        description: newGroupDescription.trim() || null
      };
      
      const data = await apiFetch('/create-group', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      if (data && data.success) {
        setNewGroupName('');
        setNewGroupDescription('');
        setShowCreateGroup(false);
        await getGroups();
        
        if (data.data && data.data.id) {
          setCurrentGroupId(data.data.id);
        }
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to create group');
        }
      }
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
    
    setCreateGroupLoading(false);
  };

  // Edit group function
  const editGroup = async () => {
    if (!editGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    
    setEditGroupLoading(true);
    setError('');
    
    try {
      const requestBody = {
        groupId: currentGroupId,
        groupName: editGroupName.trim(),
        description: editGroupDescription.trim() || null
      };
      
      const data = await apiFetch('/edit-group', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      if (data && data.success) {
        setShowEditGroup(false);
        await getGroups();
        await getMessages();
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to update group');
        }
      }
    } catch (err) {
      setError('Failed to update group. Please try again.');
    }
    
    setEditGroupLoading(false);
  };

  // Generate invite link function
  const generateInviteLink = async () => {
    if (!currentGroupId) {
      return;
    }
    
    setInviteLoading(true);
    setError('');
    
    try {
      const data = await apiFetch(`/${currentGroupId}/invite/generate`, {
        method: 'POST'
      });
      
      if (data && data.success) {
        setInviteUrl(data.data.inviteUrl);
        setShowInviteModal(true);
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to generate invite link');
        }
      }
    } catch (err) {
      setError('Failed to generate invite link');
    }
    
    setInviteLoading(false);
  };

  // Copy invite link function
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => {
        setInviteCopied(false);
      }, 2000);
    } catch (err) {
      setError('Failed to copy invite link');
    }
  };

  // Join group via invite function
  const joinViaInvite = async () => {
    if (!joinToken.trim()) {
      setError('Please enter a valid invite token');
      return;
    }
    
    setJoinLoading(true);
    setError('');
    
    try {
      const data = await apiFetch(`/join/${joinToken.trim()}`, {
        method: 'POST'
      });
      
      if (data && data.success) {
        setJoinToken('');
        setShowJoinModal(false);
        await getGroups();
        
        if (data.data && data.data.group && data.data.group.id) {
          setCurrentGroupId(data.data.group.id);
        }
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to join group');
        }
      }
    } catch (err) {
      setError('Failed to join group. Please check the invite link.');
    }
    
    setJoinLoading(false);
  };

  // Update member role function
  const updateMemberRole = async (memberId, newRole) => {
    if (!currentGroupId) {
      return;
    }
    
    const newMemberActionLoading = { ...memberActionLoading };
    newMemberActionLoading[memberId] = true;
    setMemberActionLoading(newMemberActionLoading);
    setError('');
    
    try {
      const data = await apiFetch(`/${currentGroupId}/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      
      if (data && data.success) {
        await getMessages();
        const newShowMemberActions = { ...showMemberActions };
        newShowMemberActions[memberId] = false;
        setShowMemberActions(newShowMemberActions);
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to update member role');
        }
      }
    } catch (err) {
      setError('Failed to update member role');
    }
    
    const finalMemberActionLoading = { ...memberActionLoading };
    finalMemberActionLoading[memberId] = false;
    setMemberActionLoading(finalMemberActionLoading);
  };

  // Remove member function
  const removeMember = async (memberId) => {
    if (!currentGroupId) {
      return;
    }
    
    const confirmRemove = confirm('Are you sure you want to remove this member?');
    if (!confirmRemove) {
      return;
    }
    
    const newMemberActionLoading = { ...memberActionLoading };
    newMemberActionLoading[memberId] = true;
    setMemberActionLoading(newMemberActionLoading);
    setError('');
    
    try {
      const data = await apiFetch(`/${currentGroupId}/members/${memberId}`, {
        method: 'DELETE'
      });
      
      if (data && data.success) {
        await getMessages();
        const newShowMemberActions = { ...showMemberActions };
        newShowMemberActions[memberId] = false;
        setShowMemberActions(newShowMemberActions);
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to remove member');
        }
      }
    } catch (err) {
      setError('Failed to remove member');
    }
    
    const finalMemberActionLoading = { ...memberActionLoading };
    finalMemberActionLoading[memberId] = false;
    setMemberActionLoading(finalMemberActionLoading);
  };

  // Leave group function
  const leaveGroup = async () => {
    if (!currentGroupId) {
      return;
    }
    
    const confirmLeave = confirm('Are you sure you want to leave this group?');
    if (!confirmLeave) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch(`/${currentGroupId}/leave`, {
        method: 'DELETE'
      });
      
      if (data && data.success) {
        await getGroups();
        
        const remainingGroups = [];
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].id !== currentGroupId) {
            remainingGroups.push(groups[i]);
          }
        }
        
        if (remainingGroups.length > 0) {
          setCurrentGroupId(remainingGroups[0].id);
        } else {
          setCurrentGroupId(null);
          setMessages([]);
          setMembers([]);
          setGroup(null);
        }
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to leave group');
        }
      }
    } catch (err) {
      setError('Failed to leave group');
    }
    
    setLoading(false);
  };

  // Get messages function
  const getMessages = async () => {
    if (!currentGroupId) {
      return;
    }
    
    setError('');
    
    try {
      const data = await apiFetch(`/${currentGroupId}/user-message`, { method: 'GET' });
      
      if (data && data.success) {
        setUser(data.currentUser);
        setGroup(data.group);
        
        if (data.members) {
          setMembers(data.members);
        } else {
          setMembers([]);
        }
        
        if (data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        } else {
          setOnlineUsers([]);
        }
        
        if (data.messages) {
          const formattedMessages = [];
          for (let i = 0; i < data.messages.length; i++) {
            const msg = data.messages[i];
            formattedMessages.push({
              id: msg.id,
              text: msg.content,
              userId: msg.userId,
              time: msg.createdAt,
              isMe: msg.isOwn,
              sender: msg.sender,
            });
          }
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Error loading messages');
        }
      }
    } catch (err) {
      setError('Error loading messages');
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentGroupId) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch('/user-message', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: newMessage.trim(),
          groupId: currentGroupId
        }),
      });
      
      if (data && data.success) {
        setNewMessage('');
        setTimeout(() => {
          getMessages();
        }, 500);
      } else {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Failed to send message');
        }
      }
    } catch (err) {
      setError('Failed to send message');
    }
    
    setLoading(false);
  };

  // Handle enter key press
  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Change group function
  const changeGroup = (id) => {
    setCurrentGroupId(id);
    setMessages([]);
    setMembers([]);
    setGroup(null);
    setError('');
  };

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) {
      return '';
    }
    
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return formattedHours + ':' + formattedMinutes;
  };

  // Get member info function
  const getMemberInfo = (userId) => {
    let memberName = `User ${userId}`;
    let isOnline = false;
    
    for (let i = 0; i < members.length; i++) {
      if (members[i].id === userId) {
        if (members[i].fullName) {
          memberName = members[i].fullName;
        }
        break;
      }
    }
    
    for (let i = 0; i < onlineUsers.length; i++) {
      if (onlineUsers[i] === userId) {
        isOnline = true;
        break;
      }
    }
    
    return {
      name: memberName,
      online: isOnline
    };
  };

  // Check if current user is admin
  const isCurrentUserAdmin = () => {
    if (!user || !user.id) {
      return false;
    }
    
    for (let i = 0; i < members.length; i++) {
      if (members[i].id === user.id) {
        return members[i].role === 'admin';
      }
    }
    
    return false;
  };

  // Open edit modal function
  const openEditModal = () => {
    if (group) {
      if (group.name) {
        setEditGroupName(group.name);
      } else if (group.groupName) {
        setEditGroupName(group.groupName);
      } else {
        setEditGroupName('');
      }
      
      if (group.description) {
        setEditGroupDescription(group.description);
      } else {
        setEditGroupDescription('');
      }
    } else {
      setEditGroupName('');
      setEditGroupDescription('');
    }
    
    setShowEditGroup(true);
    setError('');
  };

  // Toggle member actions function
  const toggleMemberActions = (memberId) => {
    const newShowMemberActions = { ...showMemberActions };
    newShowMemberActions[memberId] = !newShowMemberActions[memberId];
    setShowMemberActions(newShowMemberActions);
  };

  // Handle create group form submit
  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    createGroup();
  };

  // Handle edit group form submit
  const handleEditGroupSubmit = (e) => {
    e.preventDefault();
    editGroup();
  };

  // Handle join group form submit
  const handleJoinGroupSubmit = (e) => {
    e.preventDefault();
    joinViaInvite();
  };

  // Handle join token input change
  const handleJoinTokenChange = (e) => {
    const value = e.target.value;
    const tokenMatch = value.match(/\/join\/([a-f0-9]+)$/);
    if (tokenMatch) {
      setJoinToken(tokenMatch[1]);
    } else {
      setJoinToken(value);
    }
  };

  // Close create group modal
  const closeCreateGroupModal = () => {
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setError('');
  };

  // Close edit group modal
  const closeEditGroupModal = () => {
    setShowEditGroup(false);
    setError('');
  };

  // Close join group modal
  const closeJoinGroupModal = () => {
    setShowJoinModal(false);
    setJoinToken('');
    setError('');
  };

  // useEffect for scrolling to bottom when messages change
  useEffect(() => {
    scrollDown();
  }, [messages]);

  // useEffect for initial load
  useEffect(() => {
    getGroups();
    testAuth();
  }, []);

  // useEffect for getting messages when group changes
  useEffect(() => {
    if (currentGroupId) {
      getMessages();
    }
  }, [currentGroupId]);

  // useEffect for auto-refresh messages
  useEffect(() => {
    if (!currentGroupId) {
      return;
    }
    
    const interval = setInterval(() => {
      getMessages();
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [currentGroupId]);

  return (
    <div className="chat-dashboard">
      <div className="chat-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title-section">
              <div>
                {groups.length === 0 ? (
                  <h1>Chat App</h1>
                ) : (
                  <h1>{group && (group.name || group.groupName) ? (group.name || group.groupName) : 'Group Chat'}</h1>
                )}
                
                {groups.length === 0 ? (
                  <p>No groups joined</p>
                ) : (
                  group && group.description && <p>{group.description}</p>
                )}
              </div>
              <div className="header-actions">
                {group && isCurrentUserAdmin() && (
                  <>
                    <button 
                      onClick={openEditModal}
                      className="header-action-button"
                      title="Edit group details"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={generateInviteLink}
                      className="header-action-button"
                      disabled={inviteLoading}
                      title="Generate invite link"
                    >
                      <Link size={16} />
                    </button>
                  </>
                )}
                {group && (
                  <button 
                    onClick={leaveGroup}
                    className="header-action-button leave-button"
                    title="Leave group"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
            {groups.length > 1 && (
              <select 
                value={currentGroupId || ''} 
                onChange={(e) => changeGroup(parseInt(e.target.value))}
                className="group-selector"
              >
                {groups.map((groupItem) => (
                  <option key={groupItem.id} value={groupItem.id}>
                    {groupItem.name || groupItem.groupName}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="header-right">
            {groups.length === 0 ? (
              <p>0 groups</p>
            ) : (
              <p>{members.length} members • {onlineUsers.length} online</p>
            )}
            <div className="user-section">
              {user && <span className="current-user">Hi, {user.fullName}</span>}
              <button 
                onClick={handleLogout}
                className="logout-button"
                disabled={logoutLoading}
                title="Logout"
              >
                <LogOut size={16} />
                <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <AlertCircle className="error-icon"/>
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        </div>
      )}

      {groupsLoading && (
        <div className="loading-banner">
          <span>Loading groups...</span>
        </div>
      )}

      <div className="chat-container">
        <div className="sidebar">
          <div className="sidebar-header">
            {groups.length === 0 ? (
              <h3><Users className="sidebar-icon" />Groups</h3>
            ) : (
              <h3><Users className="sidebar-icon" />Members ({members.length})</h3>
            )}
            <div className="sidebar-actions">
              <button 
                onClick={getGroups} 
                className="refresh-button" 
                disabled={groupsLoading} 
                title="Refresh groups"
              >
                {groupsLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button 
                onClick={() => setShowJoinModal(true)} 
                className="join-group-button" 
                title="Join group via invite"
              >
                <UserPlus className="plus-icon"/> Join
              </button>
              <button 
                onClick={() => setShowCreateGroup(true)} 
                className="create-group-button" 
                title="Create new group"
              >
                <Plus className="plus-icon"/> Create
              </button>
            </div>
          </div>

          <div className="sidebar-content">
            {/* Create Group Modal */}
            {showCreateGroup && (
              <div className="create-group-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4>Create New Group</h4>
                    <button 
                      onClick={() => setShowCreateGroup(false)} 
                      disabled={createGroupLoading} 
                      className="modal-close"
                    >
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={handleCreateGroupSubmit} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="groupName">Group Name *</label>
                      <input 
                        id="groupName" 
                        type="text" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        disabled={createGroupLoading} 
                        required 
                        maxLength={50} 
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="groupDescription">Description (Optional)</label>
                      <textarea 
                        id="groupDescription" 
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        disabled={createGroupLoading} 
                        rows={3} 
                        maxLength={200} 
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={closeCreateGroupModal} 
                        disabled={createGroupLoading} 
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={createGroupLoading || !newGroupName.trim()} 
                        className="submit-button"
                      >
                        {createGroupLoading ? 'Creating...' : 'Create Group'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Group Modal */}
            {showEditGroup && (
              <div className="create-group-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4>Edit Group</h4>
                    <button 
                      onClick={() => setShowEditGroup(false)} 
                      disabled={editGroupLoading} 
                      className="modal-close"
                    >
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={handleEditGroupSubmit} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="editGroupName">Group Name *</label>
                      <input 
                        id="editGroupName" 
                        type="text" 
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        disabled={editGroupLoading} 
                        required 
                        maxLength={50} 
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="editGroupDescription">Description (Optional)</label>
                      <textarea 
                        id="editGroupDescription" 
                        value={editGroupDescription}
                        onChange={(e) => setEditGroupDescription(e.target.value)}
                        disabled={editGroupLoading} 
                        rows={3} 
                        maxLength={200} 
                        className="form-textarea"
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={closeEditGroupModal} 
                        disabled={editGroupLoading} 
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={editGroupLoading || !editGroupName.trim()} 
                        className="submit-button"
                      >
                        {editGroupLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Invite Link Modal */}
            {showInviteModal && (
              <div className="create-group-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4>Invite Link Generated</h4>
                    <button 
                      onClick={() => setShowInviteModal(false)} 
                      className="modal-close"
                    >
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <div className="invite-content">
                    <p>Share this link with others to invite them to the group:</p>
                    <div className="invite-url-container">
                      <input 
                        type="text" 
                        value={inviteUrl} 
                        readOnly 
                        className="invite-url-input"
                      />
                      <button 
                        onClick={copyInviteLink}
                        className="copy-button"
                        title="Copy to clipboard"
                      >
                        {inviteCopied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="invite-note">This link will expire in 7 days.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
              <div className="create-group-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4>Join Group</h4>
                    <button 
                      onClick={() => setShowJoinModal(false)} 
                      disabled={joinLoading} 
                      className="modal-close"
                    >
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={handleJoinGroupSubmit} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="joinToken">Invite Token or Link</label>
                      <input 
                        id="joinToken" 
                        type="text" 
                        value={joinToken}
                        onChange={handleJoinTokenChange}
                        disabled={joinLoading} 
                        placeholder="Paste invite link or token"
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={closeJoinGroupModal} 
                        disabled={joinLoading} 
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={joinLoading || !joinToken.trim()} 
                        className="submit-button"
                      >
                        {joinLoading ? 'Joining...' : 'Join Group'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {groupsLoading ? (
              <div className="loading-state">
                <p>Loading groups...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon"/>
                <h4>No Groups</h4>
                <p>You are not part of any groups yet.</p>
                <div className="empty-help">
                  <p>Join a group using an invite link or create a new one</p>
                  <button onClick={getGroups} className="retry-button">Try Again</button>
                </div>
              </div>
            ) : members.length === 0 ? (
              <p>Loading members...</p>
            ) : (
              <div className="users-list">
                {members.map((member) => {
                  const memberInfo = getMemberInfo(member.id);
                  const isMe = member.id === user?.id;
                  const isAdmin = isCurrentUserAdmin();
                  const canManage = isAdmin && !isMe;
                  
                  return (
                    <div key={member.id} className={`user-item ${isMe ? 'user-item-me' : ''}`}>
                      <div className="user-avatar-container">
                        <div className="user-initial">
                          {member.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {memberInfo.online && <div className="online-indicator"></div>}
                      </div>
                      <div className="user-details">
                        <p className="user-name">
                          {member.fullName} {isMe && '(You)'}
                        </p>
                        <div className="user-badges">
                          <span className={`role-badge ${member.role === 'admin' ? 'role-admin' : 'role-member'}`}>
                            {member.role || 'member'}
                          </span>
                          <span className={`status-badge ${memberInfo.online ? 'status-online' : 'status-offline'}`}>
                            {memberInfo.online ? 'online' : 'offline'}
                          </span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="member-actions">
                          <button 
                            onClick={() => toggleMemberActions(member.id)}
                            className="member-actions-button"
                            disabled={memberActionLoading[member.id]}
                          >
                            •••
                          </button>
                          {showMemberActions[member.id] && (
                            <div className="member-actions-dropdown">
                              {member.role === 'member' ? (
                                <button 
                                  onClick={() => updateMemberRole(member.id, 'admin')}
                                  className="action-item promote"
                                  disabled={memberActionLoading[member.id]}
                                >
                                  <Shield size={14} /> Promote to Admin
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateMemberRole(member.id, 'member')}
                                  className="action-item demote"
                                  disabled={memberActionLoading[member.id]}
                                >
                                  <Shield size={14} /> Remove Admin
                                </button>
                              )}
                              <button 
                                onClick={() => removeMember(member.id)}
                                className="action-item remove"
                                disabled={memberActionLoading[member.id]}
                              >
                                <UserMinus size={14} /> Remove Member
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {groups.length === 0 ? (
              <div className="no-groups-state">
                <MessageSquare className="no-groups-icon"/>
                <h3>No Groups</h3>
                <p>You need to join a group to start chatting.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="no-messages-state">
                <MessageSquare className="no-messages-icon"/>
                <p>{error ? 'Cannot load messages' : 'No messages yet. Start chatting!'}</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => {
                  const memberInfo = getMemberInfo(message.userId);
                  return (
                    <div key={message.id} className={`message ${message.isMe ? 'my-message' : 'other-message'}`}>
                      <div className="message-avatar">
                        <div className="message-initial">
                          {message.sender?.fullName?.charAt(0).toUpperCase() || memberInfo.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="message-content">
                        {!message.isMe && (
                          <div className="message-sender">
                            {message.sender?.fullName || memberInfo.name}
                          </div>
                        )}
                        <div className="message-bubble">
                          <p>{message.text}</p>
                        </div>
                        <div className="message-time">{formatTime(message.time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          <div className="message-input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleEnter}
              placeholder={
                groups.length === 0
                  ? 'Join a group to chat...'
                  : currentGroupId
                    ? 'Type message...'
                    : 'Select group first'
              }
              disabled={loading || !currentGroupId || groups.length === 0}
              className="message-input"
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !newMessage.trim() || !currentGroupId || groups.length === 0} 
              className="send-button"
            >
              <Send className="send-icon" />
              <span>{loading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatDashboard;