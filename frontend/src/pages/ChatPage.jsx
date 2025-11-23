import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import websocketService from '../services/websocket';
import { messageAPI } from '../services/api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import './ChatPage.css';

function ChatPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const {
        conversations,
        setConversations,
        activeConversation,
        addMessage,
        updateMessageStatus,
        setTyping,
        wsConnected,
        setWsConnected,
        resetChat,
    } = useChatStore();

    const [loading, setLoading] = useState(true);
    const [showMobileChat, setShowMobileChat] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        initializeChat();

        return () => {
            websocketService.disconnect();
            resetChat();
        };
    }, [user]);

    // Show chat window when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            setShowMobileChat(true);
        }
    }, [activeConversation]);

    const initializeChat = async () => {
        try {
            // Load user conversations
            const response = await messageAPI.getUserConversations(user.id);
            setConversations(response.data);

            // Connect to WebSocket with connection status callback
            await websocketService.connect(
                user.id,
                handleMessageReceived,
                handleStatusUpdate,
                handleTyping,
                handleConnectionChange
            );
            setWsConnected(true);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setWsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectionChange = (connected) => {
        console.log('WebSocket connection status changed:', connected);
        setWsConnected(connected);
    };

    const handleMessageReceived = (message) => {
        console.log('Message received:', message);

        // Determine which user this message is for/from
        const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;

        addMessage(otherUserId, message);

        // Mark as delivered if we're the receiver
        if (message.receiverId === user.id && message.status === 'SENT') {
            websocketService.markAsDelivered(message.id, message.senderId);
        }
    };

    const handleStatusUpdate = (notification) => {
        console.log('Status update:', notification);
        updateMessageStatus(notification.messageId, notification.status);
    };

    const handleTyping = (notification) => {
        console.log('Typing notification:', notification);
        setTyping(notification.senderId, notification.isTyping);
    };

    const handleLogout = () => {
        websocketService.disconnect();
        logout();
        resetChat();
        navigate('/login');
    };

    const handleBackToConversations = () => {
        setShowMobileChat(false);
    };

    if (loading) {
        return (
            <div className="chat-loading">
                <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
                <p>Loading your chats...</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <div className="header-left">
                    <h2>Chat Application</h2>
                    <div className="connection-status">
                        {wsConnected ? (
                            <>
                                <Wifi size={16} className="status-icon connected" />
                                <span>Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff size={16} className="status-icon disconnected" />
                                <span>Disconnected</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-email">{user.email}</span>
                        {user.username && <span className="user-username">@{user.username}</span>}
                    </div>
                    <button onClick={handleLogout} className="btn-icon" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`chat-container ${showMobileChat ? 'show-chat' : 'show-conversations'}`}>
                <ConversationList />
                <ChatWindow onBackToConversations={handleBackToConversations} />
            </div>
        </div>
    );
}

export default ChatPage;
