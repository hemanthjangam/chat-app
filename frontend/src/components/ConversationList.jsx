import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { userAPI, messageAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import './ConversationList.css';

function ConversationList() {
    const user = useAuthStore((state) => state.user);
    const { conversations, activeConversation, setActiveConversation, addConversation } = useChatStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            handleSearch();
        } else {
            setSearchResults([]);
            setShowSearch(false);
        }
    }, [searchQuery]);

    const handleSearch = async () => {
        setSearching(true);
        setShowSearch(true);
        try {
            const response = await userAPI.searchUsers(searchQuery);
            // Filter out current user from results
            const filtered = response.data.filter(u => u.id !== user.id);
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectUser = async (selectedUser) => {
        // Check if conversation already exists
        const existing = conversations.find(c => c.otherUserId === selectedUser.id);

        if (existing) {
            setActiveConversation(existing);
        } else {
            // Create new conversation object
            const newConversation = {
                otherUserId: selectedUser.id,
                otherUserEmail: selectedUser.email,
                otherUsername: selectedUser.username,
                lastMessageContent: null,
                lastMessageTime: null,
                unreadCount: 0,
                otherUserStatus: selectedUser.status,
            };

            addConversation(newConversation);
            setActiveConversation(newConversation);
        }

        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="conversation-list">
            {/* Search Bar */}
            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                                setShowSearch(false);
                            }}
                            className="clear-search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results */}
            {showSearch && (
                <div className="search-results">
                    {searching ? (
                        <div className="search-loading">
                            <div className="spinner"></div>
                            <span>Searching...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <>
                            <div className="search-header">Search Results</div>
                            {searchResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="search-result-item"
                                    onClick={() => handleSelectUser(result)}
                                >
                                    <div className="user-avatar">
                                        {result.profilePicture ? (
                                            <img src={result.profilePicture} alt={result.username} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {getInitials(result.username || result.email)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <div className="user-name">{result.username}</div>
                                        <div className="user-email-small">{result.email}</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="no-results">No users found</div>
                    )}
                </div>
            )}

            {/* Conversations List */}
            {!showSearch && (
                <div className="conversations">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                            <small>Search for users to start chatting</small>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.otherUserId}
                                className={`conversation-item ${activeConversation?.otherUserId === conv.otherUserId ? 'active' : ''
                                    }`}
                                onClick={() => setActiveConversation(conv)}
                            >
                                <div className="user-avatar">
                                    <div className="avatar-placeholder">
                                        {getInitials(conv.otherUsername || conv.otherUserEmail)}
                                    </div>
                                    {conv.otherUserStatus === 'ONLINE' && <div className="online-indicator"></div>}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <span className="conversation-name">{conv.otherUsername}</span>
                                        {conv.lastMessageTime && (
                                            <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                                        )}
                                    </div>
                                    <div className="conversation-preview">
                                        {conv.lastMessageContent || 'No messages yet'}
                                    </div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="unread-badge">{conv.unreadCount}</div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default ConversationList;
