import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.userId = null;
        this.subscriptions = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.onConnectionChange = null;
        this.messageHandlers = null;
    }

    connect(userId, onMessageReceived, onStatusUpdate, onTyping, onConnectionChange = null) {
        return new Promise((resolve, reject) => {
            this.userId = userId;
            this.onConnectionChange = onConnectionChange;
            this.messageHandlers = { onMessageReceived, onStatusUpdate, onTyping };

            this._attemptConnection(resolve, reject);
        });
    }

    _attemptConnection(resolve, reject) {
        try {
            // Create SockJS instance
            const socket = new SockJS(`http://localhost:8080/ws?userId=${this.userId}`);

            // Create STOMP client
            this.client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    console.log('STOMP: ' + str);
                },
                reconnectDelay: 0, // We'll handle reconnection manually
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = () => {
                console.log('WebSocket Connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;

                // Notify connection change
                if (this.onConnectionChange) {
                    this.onConnectionChange(true);
                }

                // Subscribe to user's message queue
                this.subscriptions.messages = this.client.subscribe(
                    `/user/${this.userId}/queue/messages`,
                    (message) => {
                        const data = JSON.parse(message.body);
                        this.messageHandlers.onMessageReceived(data);
                    }
                );

                // Subscribe to notifications (delivery/read receipts)
                this.subscriptions.notifications = this.client.subscribe(
                    `/user/${this.userId}/queue/notifications`,
                    (message) => {
                        const data = JSON.parse(message.body);
                        this.messageHandlers.onStatusUpdate(data);
                    }
                );

                // Subscribe to typing indicators
                this.subscriptions.typing = this.client.subscribe(
                    `/user/${this.userId}/queue/typing`,
                    (message) => {
                        const data = JSON.parse(message.body);
                        this.messageHandlers.onTyping(data);
                    }
                );

                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('STOMP error: ' + frame.headers['message']);
                console.error('Details: ' + frame.body);
                this.connected = false;

                // Notify connection change
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }

                // Attempt to reconnect
                this._scheduleReconnect();

                if (this.reconnectAttempts === 0) {
                    reject(frame);
                }
            };

            this.client.onWebSocketClose = () => {
                console.log('WebSocket Disconnected');
                this.connected = false;

                // Notify connection change
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }

                // Attempt to reconnect
                this._scheduleReconnect();
            };

            this.client.onWebSocketError = (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;

                // Notify connection change
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }
            };

            this.client.activate();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.connected = false;

            if (this.onConnectionChange) {
                this.onConnectionChange(false);
            }

            this._scheduleReconnect();
            reject(error);
        }
    }

    _scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (!this.connected && this.userId && this.messageHandlers) {
                console.log('Reconnecting...');
                this._attemptConnection(() => {
                    console.log('Reconnected successfully');
                }, (error) => {
                    console.error('Reconnection failed:', error);
                });
            }
        }, delay);
    }

    disconnect() {
        if (this.client) {
            // Unsubscribe from all subscriptions
            Object.values(this.subscriptions).forEach(sub => {
                if (sub) sub.unsubscribe();
            });
            this.subscriptions = {};

            this.client.deactivate();
            this.connected = false;
            this.userId = null;
            this.reconnectAttempts = 0;
            this.messageHandlers = null;
            this.onConnectionChange = null;
        }
    }

    sendMessage(senderId, receiverId, content) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return;
        }

        this.client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({
                senderId,
                receiverId,
                content,
            }),
        });
    }

    sendTypingIndicator(senderId, receiverId, isTyping) {
        if (!this.connected || !this.client) {
            return;
        }

        this.client.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({
                senderId,
                receiverId,
                isTyping,
            }),
        });
    }

    markAsDelivered(messageId, senderId) {
        if (!this.connected || !this.client) {
            return;
        }

        this.client.publish({
            destination: '/app/chat.delivered',
            body: JSON.stringify({
                messageId,
                senderId,
            }),
        });
    }

    markAsRead(messageId, senderId) {
        if (!this.connected || !this.client) {
            return;
        }

        this.client.publish({
            destination: '/app/chat.read',
            body: JSON.stringify({
                messageId,
                senderId,
            }),
        });
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketService();
