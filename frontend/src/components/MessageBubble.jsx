import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import './MessageBubble.css';

function MessageBubble({ message, isSent }) {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            return format(new Date(timestamp), 'HH:mm');
        } catch {
            return '';
        }
    };

    const getStatusIcon = () => {
        if (!isSent) return null;

        switch (message.status) {
            case 'SENT':
                return <Check size={14} className="status-icon" />;
            case 'DELIVERED':
                return <CheckCheck size={14} className="status-icon" />;
            case 'READ':
                return <CheckCheck size={14} className="status-icon status-read" />;
            default:
                return null;
        }
    };

    return (
        <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
            <div className="message-content">
                <p className="message-text">{message.content}</p>
                <div className="message-meta">
                    <span className="message-time">{formatTime(message.sentAt)}</span>
                    {getStatusIcon()}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
