import { create } from 'zustand';

const useChatStore = create((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: {},
    typingUsers: {},
    wsConnected: false,

    setConversations: (conversations) => set({ conversations }),

    setActiveConversation: (conversation) => set({ activeConversation: conversation }),

    addConversation: (conversation) => set((state) => {
        const exists = state.conversations.find(c => c.otherUserId === conversation.otherUserId);
        if (exists) return state;
        return { conversations: [conversation, ...state.conversations] };
    }),

    updateConversation: (userId, updates) => set((state) => ({
        conversations: state.conversations.map(conv =>
            conv.otherUserId === userId ? { ...conv, ...updates } : conv
        )
    })),

    setMessages: (userId, messages) => set((state) => ({
        messages: { ...state.messages, [userId]: messages }
    })),

    addMessage: (userId, message) => set((state) => {
        const userMessages = state.messages[userId] || [];
        const messageExists = userMessages.some(m => m.id === message.id);

        if (messageExists) {
            // Update existing message
            return {
                messages: {
                    ...state.messages,
                    [userId]: userMessages.map(m => m.id === message.id ? message : m)
                }
            };
        }

        // Add new message
        return {
            messages: {
                ...state.messages,
                [userId]: [...userMessages, message]
            }
        };
    }),

    updateMessageStatus: (messageId, status) => set((state) => {
        const newMessages = { ...state.messages };

        Object.keys(newMessages).forEach(userId => {
            newMessages[userId] = newMessages[userId].map(msg =>
                msg.id === messageId ? { ...msg, status } : msg
            );
        });

        return { messages: newMessages };
    }),

    setTyping: (userId, isTyping) => set((state) => ({
        typingUsers: { ...state.typingUsers, [userId]: isTyping }
    })),

    setWsConnected: (connected) => set({ wsConnected: connected }),

    clearMessages: (userId) => set((state) => {
        const newMessages = { ...state.messages };
        delete newMessages[userId];
        return { messages: newMessages };
    }),

    resetChat: () => set({
        conversations: [],
        activeConversation: null,
        messages: {},
        typingUsers: {},
        wsConnected: false,
    }),
}));

export default useChatStore;
