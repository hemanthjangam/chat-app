import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    sendOtp: (email, purpose) =>
        api.post('/auth/send-otp', { email, purpose }),

    verifyOtp: (email, otp, purpose, username = null) =>
        api.post('/auth/verify-otp', { email, otp, purpose, username }),
};

// User API
export const userAPI = {
    searchUsers: (query) =>
        api.get('/users/search', { params: { query } }),
};

// Message API
export const messageAPI = {
    getConversation: (userId1, userId2, page = 0, size = 50) =>
        api.get('/messages/conversation', {
            params: { userId1, userId2, page, size }
        }),

    getUserConversations: (userId) =>
        api.get('/messages/conversations', { params: { userId } }),

    getUnreadMessages: (receiverId) =>
        api.get('/messages/unread', { params: { receiverId } }),

    getUnreadCount: (receiverId, senderId) =>
        api.get('/messages/unread/count', {
            params: { receiverId, senderId }
        }),

    markAsRead: (messageId) =>
        api.put(`/messages/${messageId}/read`),

    markConversationAsRead: (receiverId, senderId) =>
        api.put('/messages/conversation/read', null, {
            params: { receiverId, senderId }
        }),
};

export default api;
