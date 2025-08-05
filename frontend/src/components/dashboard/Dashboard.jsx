import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Send, Users, AlertCircle, MessageSquare, Plus, X, Edit2, Save, Link, UserPlus, UserMinus, Shield, LogOut, Copy, Check } from 'lucide-react';
import './dashboard.css';

const GroupChatDashboard = () => {
  const navigate = useNavigate();

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
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [createGroupLoading, setCreateGroupLoading] = useState(false);

  // Existing edit group states
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupLoading, setEditGroupLoading] = useState(false);

  // New states for invite management
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // New states for member management
  const [showMemberActions, setShowMemberActions] = useState({});
  const [memberActionLoading, setMemberActionLoading] = useState({});

  // New states for join via invite
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinToken, setJoinToken] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const messagesEnd = useRef(null);
  const scrollDown = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollDown, [messages]);

  const handleAuthRedirect = (status) => {
    if (status === 401 || status === 403) {
      navigate('/login');
      return true;
    }
    return false;
  };

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`http://localhost:5000/api/v1${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
    if (handleAuthRedirect(res.status)) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  };

  const getGroups = async () => {
    setGroupsLoading(true);
    setError('');
    try {
      const data = await apiFetch('/get-groups', { method: 'GET' });
      if (data?.success) {
        setGroups(data.groups || []);
        if (data.groups?.length > 0 && !currentGroupId) {
          setCurrentGroupId(data.groups[0].id);
        }
      } else {
        setError(data?.message || 'Failed to fetch groups');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupsLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      const data = await apiFetch('/auth/check', { method: 'GET' });
      if (data) setDebugInfo(prev => prev + `\nAuth: ${JSON.stringify(data)}`);
    } catch (err) {
      setDebugInfo(prev => prev + `\nAuth failed: ${err.message}`);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    setCreateGroupLoading(true);
    setError('');
    try {
      const data = await apiFetch('/create-group', {
        method: 'POST',
        body: JSON.stringify({ groupName: newGroupName.trim(), description: newGroupDescription.trim() || null }),
      });
      if (data?.success) {
        setNewGroupName('');
        setNewGroupDescription('');
        setShowCreateGroup(false);
        await getGroups();
        if (data.data?.id) setCurrentGroupId(data.data.id);
      } else {
        setError(data?.message || 'Failed to create group');
      }
    } catch {
      setError('Failed to create group. Please try again.');
    } finally {
      setCreateGroupLoading(false);
    }
  };

  const editGroup = async () => {
    if (!editGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    setEditGroupLoading(true);
    setError('');
    try {
      const data = await apiFetch('/edit-group', {
        method: 'POST',
        body: JSON.stringify({ 
          groupId: currentGroupId,
          groupName: editGroupName.trim(), 
          description: editGroupDescription.trim() || null 
        }),
      });
      if (data?.success) {
        setShowEditGroup(false);
        await getGroups();
        await getMessages();
      } else {
        setError(data?.message || 'Failed to update group');
      }
    } catch {
      setError('Failed to update group. Please try again.');
    } finally {
      setEditGroupLoading(false);
    }
  };

  // New function: Generate invite link
  const generateInviteLink = async () => {
    if (!currentGroupId) return;
    setInviteLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/${currentGroupId}/invite/generate`, {
        method: 'POST'
      });
      if (data?.success) {
        setInviteUrl(data.data.inviteUrl);
        setShowInviteModal(true);
      } else {
        setError(data?.message || 'Failed to generate invite link');
      }
    } catch {
      setError('Failed to generate invite link');
    } finally {
      setInviteLoading(false);
    }
  };

  // New function: Copy invite link
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      setError('Failed to copy invite link');
    }
  };

  // New function: Join group via invite
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
      if (data?.success) {
        setJoinToken('');
        setShowJoinModal(false);
        await getGroups();
        if (data.data?.group?.id) {
          setCurrentGroupId(data.data.group.id);
        }
      } else {
        setError(data?.message || 'Failed to join group');
      }
    } catch {
      setError('Failed to join group. Please check the invite link.');
    } finally {
      setJoinLoading(false);
    }
  };

  // New function: Update member role
  const updateMemberRole = async (memberId, newRole) => {
    if (!currentGroupId) return;
    setMemberActionLoading(prev => ({ ...prev, [memberId]: true }));
    setError('');
    try {
      const data = await apiFetch(`/${currentGroupId}/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (data?.success) {
        await getMessages(); // Refresh to get updated member info
        setShowMemberActions(prev => ({ ...prev, [memberId]: false }));
      } else {
        setError(data?.message || 'Failed to update member role');
      }
    } catch {
      setError('Failed to update member role');
    } finally {
      setMemberActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  // New function: Remove member
  const removeMember = async (memberId) => {
    if (!currentGroupId || !confirm('Are you sure you want to remove this member?')) return;
    setMemberActionLoading(prev => ({ ...prev, [memberId]: true }));
    setError('');
    try {
      const data = await apiFetch(`/${currentGroupId}/members/${memberId}`, {
        method: 'DELETE'
      });
      if (data?.success) {
        await getMessages(); // Refresh to get updated member list
        setShowMemberActions(prev => ({ ...prev, [memberId]: false }));
      } else {
        setError(data?.message || 'Failed to remove member');
      }
    } catch {
      setError('Failed to remove member');
    } finally {
      setMemberActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  // New function: Leave group
  const leaveGroup = async () => {
    if (!currentGroupId || !confirm('Are you sure you want to leave this group?')) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/${currentGroupId}/leave`, {
        method: 'DELETE'
      });
      if (data?.success) {
        await getGroups();
        // Switch to another group if available
        const remainingGroups = groups.filter(g => g.id !== currentGroupId);
        if (remainingGroups.length > 0) {
          setCurrentGroupId(remainingGroups[0].id);
        } else {
          setCurrentGroupId(null);
          setMessages([]);
          setMembers([]);
          setGroup(null);
        }
      } else {
        setError(data?.message || 'Failed to leave group');
      }
    } catch {
      setError('Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async () => {
    if (!currentGroupId) return;
    setError('');
    try {
      const data = await apiFetch(`/${currentGroupId}/user-message`, { method: 'GET' });
      if (data?.success) {
        setUser(data.currentUser);
        setGroup(data.group);
        setMembers(data.members || []);
        setOnlineUsers(data.onlineUsers || []);
        setMessages((data.messages || []).map((m) => ({
          id: m.id, text: m.content, userId: m.userId,
          time: m.createdAt, isMe: m.isOwn, sender: m.sender,
        })));
      } else {
        setError(data?.message || 'Error loading messages');
      }
    } catch {
      setError('Error loading messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentGroupId) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/user-message', {
        method: 'POST',
        body: JSON.stringify({ userMessage: newMessage.trim(), groupId: currentGroupId }),
      });
      if (data?.success) {
        setNewMessage('');
        setTimeout(getMessages, 500);
      } else {
        setError(data?.message || 'Failed to send message');
      }
    } catch {
      setError('Failed to send message');
    }
    setLoading(false);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const changeGroup = (id) => {
    setCurrentGroupId(id);
    setMessages([]);
    setMembers([]);
    setGroup(null);
    setError('');
  };

  const formatTime = (t) => {
    if (!t) return '';
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMemberInfo = (uid) => {
    const m = members.find((x) => x.id === uid);
    return { name: m?.fullName || `User ${uid}`, online: onlineUsers.includes(uid) };
  };

  const isCurrentUserAdmin = () => {
    const currentMember = members.find(m => m.id === user?.id);
    return currentMember?.role === 'admin';
  };

  const openEditModal = () => {
    setEditGroupName(group?.name || group?.groupName || '');
    setEditGroupDescription(group?.description || '');
    setShowEditGroup(true);
    setError('');
  };

  const toggleMemberActions = (memberId) => {
    setShowMemberActions(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  useEffect(() => {
    getGroups();
    testAuth();
  }, []);

  useEffect(() => {
    if (currentGroupId) getMessages();
  }, [currentGroupId]);

  useEffect(() => {
    if (!currentGroupId) return;
    const iv = setInterval(getMessages, 10000);
    return () => clearInterval(iv);
  }, [currentGroupId]);

  return (
    <div className="chat-dashboard">
      <div className="chat-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title-section">
              <div>
                <h1>{groups.length === 0 ? 'Chat App' : (group?.name || group?.groupName || 'Group Chat')}</h1>
                {groups.length === 0 ? <p>No groups joined</p> : group?.description && <p>{group.description}</p>}
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
              <select value={currentGroupId || ''} onChange={(e) => changeGroup(parseInt(e.target.value))}
                className="group-selector"
              >
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name || g.groupName}</option>)}
              </select>
            )}
          </div>
          <div className="header-right">
            <p>{groups.length === 0 ? '0 groups' : `${members.length} members • ${onlineUsers.length} online`}</p>
            {user && <span className="current-user">Hi, {user.fullName}</span>}
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
        <div className="loading-banner"><span>Loading groups...</span></div>
      )}

      <div className="chat-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3><Users className="sidebar-icon" />{groups.length === 0 ? 'Groups' : `Members (${members.length})`}</h3>
            <div className="sidebar-actions">
              <button onClick={getGroups} className="refresh-button" disabled={groupsLoading} title="Refresh groups">
                {groupsLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button onClick={() => setShowJoinModal(true)} className="join-group-button" title="Join group via invite">
                <UserPlus className="plus-icon"/> Join
              </button>
              <button onClick={() => setShowCreateGroup(true)} className="create-group-button" title="Create new group">
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
                    <button onClick={() => setShowCreateGroup(false)} disabled={createGroupLoading} className="modal-close">
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); createGroup(); }} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="groupName">Group Name *</label>
                      <input id="groupName" type="text" value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        disabled={createGroupLoading} required maxLength={50} className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="groupDescription">Description (Optional)</label>
                      <textarea id="groupDescription" value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        disabled={createGroupLoading} rows={3} maxLength={200} className="form-textarea"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={() => { setShowCreateGroup(false); setNewGroupName(''); setNewGroupDescription(''); setError(''); }} disabled={createGroupLoading} className="cancel-button">
                        Cancel
                      </button>
                      <button type="submit" disabled={createGroupLoading || !newGroupName.trim()} className="submit-button">
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
                    <button onClick={() => setShowEditGroup(false)} disabled={editGroupLoading} className="modal-close">
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); editGroup(); }} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="editGroupName">Group Name *</label>
                      <input id="editGroupName" type="text" value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        disabled={editGroupLoading} required maxLength={50} className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="editGroupDescription">Description (Optional)</label>
                      <textarea id="editGroupDescription" value={editGroupDescription}
                        onChange={(e) => setEditGroupDescription(e.target.value)}
                        disabled={editGroupLoading} rows={3} maxLength={200} className="form-textarea"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={() => { setShowEditGroup(false); setError(''); }} disabled={editGroupLoading} className="cancel-button">
                        Cancel
                      </button>
                      <button type="submit" disabled={editGroupLoading || !editGroupName.trim()} className="submit-button">
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
                    <button onClick={() => setShowInviteModal(false)} className="modal-close">
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
                    <button onClick={() => setShowJoinModal(false)} disabled={joinLoading} className="modal-close">
                      <X className="close-icon"/>
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); joinViaInvite(); }} className="create-group-form">
                    <div className="form-group">
                      <label htmlFor="joinToken">Invite Token or Link</label>
                      <input 
                        id="joinToken" 
                        type="text" 
                        value={joinToken}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Extract token from full URL if pasted
                          const tokenMatch = value.match(/\/join\/([a-f0-9]+)$/);
                          setJoinToken(tokenMatch ? tokenMatch[1] : value);
                        }}
                        disabled={joinLoading} 
                        placeholder="Paste invite link or token"
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={() => { setShowJoinModal(false); setJoinToken(''); setError(''); }} disabled={joinLoading} className="cancel-button">
                        Cancel
                      </button>
                      <button type="submit" disabled={joinLoading || !joinToken.trim()} className="submit-button">
                        {joinLoading ? 'Joining...' : 'Join Group'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {groupsLoading ? (
              <div className="loading-state"><p>Loading groups...</p></div>
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
                {members.map((m) => {
                  const info = getMemberInfo(m.id);
                  const isMe = m.id === user?.id;
                  const isAdmin = isCurrentUserAdmin();
                  const canManage = isAdmin && !isMe;
                  
                  return (
                    <div key={m.id} className={`user-item ${isMe ? 'user-item-me' : ''}`}>
                      <div className="user-avatar-container">
                        <div className="user-initial">{m.fullName?.charAt(0).toUpperCase() || 'U'}</div>
                        {info.online && <div className="online-indicator"></div>}
                      </div>
                      <div className="user-details">
                        <p className="user-name">{m.fullName} {isMe && '(You)'}</p>
                        <div className="user-badges">
                          <span className={`role-badge ${m.role === 'admin' ? 'role-admin' : 'role-member'}`}>{m.role || 'member'}</span>
                          <span className={`status-badge ${info.online ? 'status-online' : 'status-offline'}`}>{info.online ? 'online' : 'offline'}</span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="member-actions">
                          <button 
                            onClick={() => toggleMemberActions(m.id)}
                            className="member-actions-button"
                            disabled={memberActionLoading[m.id]}
                          >
                            •••
                          </button>
                          {showMemberActions[m.id] && (
                            <div className="member-actions-dropdown">
                              {m.role === 'member' ? (
                                <button 
                                  onClick={() => updateMemberRole(m.id, 'admin')}
                                  className="action-item promote"
                                  disabled={memberActionLoading[m.id]}
                                >
                                  <Shield size={14} /> Promote to Admin
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateMemberRole(m.id, 'member')}
                                  className="action-item demote"
                                  disabled={memberActionLoading[m.id]}
                                >
                                  <Shield size={14} /> Remove Admin
                                </button>
                              )}
                              <button 
                                onClick={() => removeMember(m.id)}
                                className="action-item remove"
                                disabled={memberActionLoading[m.id]}
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
                {messages.map((msg) => {
                  const info = getMemberInfo(msg.userId);
                  return (
                    <div key={msg.id} className={`message ${msg.isMe ? 'my-message' : 'other-message'}`}>
                      <div className="message-avatar">
                        <div className="message-initial">
                          {msg.sender?.fullName?.charAt(0).toUpperCase() || info.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="message-content">
                        {!msg.isMe && <div className="message-sender">{msg.sender?.fullName || info.name}</div>}
                        <div className="message-bubble"><p>{msg.text}</p></div>
                        <div className="message-time">{formatTime(msg.time)}</div>
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
            <button onClick={sendMessage} disabled={loading || !newMessage.trim() || !currentGroupId || groups.length === 0} className="send-button">
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