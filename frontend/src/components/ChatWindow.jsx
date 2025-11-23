import { useState, useEffect, useRef } from 'react';
import { Send, Loader, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import websocketService from '../services/websocket';
import { messageAPI } from '../services/api';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

function ChatWindow({ onBackToConversations }) {
    const user = useAuthStore((state) => state.user);
    const { activeConversation, messages, setMessages, addMessage, typingUsers } = useChatStore();

    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (activeConversation) {
            loadMessages();
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeConversation]);

    useEffect(() => {
        // Check if other user is typing
        if (activeConversation) {
            const typing = typingUsers[activeConversation.otherUserId];
            setIsTyping(typing || false);
        }
    }, [typingUsers, activeConversation]);

    const loadMessages = async () => {
        if (!activeConversation || !user) return;

        setLoading(true);
        try {
            const response = await messageAPI.getConversation(
                user.id,
                activeConversation.otherUserId
            );

            // response.data is a Page object with content array
            const messageList = response.data.content || [];
            setMessages(activeConversation.otherUserId, messageList);

            // Mark conversation as read
            await messageAPI.markConversationAsRead(user.id, activeConversation.otherUserId);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages(activeConversation.otherUserId, []);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!activeConversation) return;

        // Send typing indicator
        websocketService.sendTypingIndicator(user.id, activeConversation.otherUserId, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            websocketService.sendTypingIndicator(user.id, activeConversation.otherUserId, false);
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!messageText.trim() || !activeConversation || !user) return;

        const content = messageText.trim();
        setMessageText('');

        // Clear typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        websocketService.sendTypingIndicator(user.id, activeConversation.otherUserId, false);

        // Send message via WebSocket
        websocketService.sendMessage(user.id, activeConversation.otherUserId, content);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    if (!activeConversation) {
        return (
            <div className="chat-window">
                <div className="no-chat-selected">
                    <div className="no-chat-icon">💬</div>
                    <h3>Select a conversation</h3>
                    <p>Choose a conversation from the list or search for a user to start chatting</p>
                </div>
            </div>
        );
    }

    const conversationMessages = messages[activeConversation.otherUserId] || [];

    return (
        <div className="chat-window">
            {/* Chat Header */}
            <div className="chat-window-header">
                {onBackToConversations && (
                    <button
                        onClick={onBackToConversations}
                        className="back-button"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="chat-user-info">
                    <div className="user-avatar-small">
                        <div className="avatar-placeholder-small">
                            {getInitials(activeConversation.otherUsername || activeConversation.otherUserEmail)}
                        </div>
                        {activeConversation.otherUserStatus === 'ONLINE' && (
                            <div className="online-indicator-small"></div>
                        )}
                    </div>
                    <div className="chat-user-details">
                        <div className="chat-user-name">{activeConversation.otherUsername}</div>
                        <div className="chat-user-status">
                            {isTyping ? 'typing...' : activeConversation.otherUserStatus?.toLowerCase() || 'offline'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
                {loading ? (
                    <div className="messages-loading">
                        <Loader className="spinner-icon" />
                        <span>Loading messages...</span>
                    </div>
                ) : conversationMessages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet</p>
                        <small>Send a message to start the conversation</small>
                    </div>
                ) : (
                    <div className="messages-list">
                        {conversationMessages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isSent={message.senderId === user.id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="message-input-container">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                    }}
                    className="message-input"
                    autoFocus
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!messageText.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;
