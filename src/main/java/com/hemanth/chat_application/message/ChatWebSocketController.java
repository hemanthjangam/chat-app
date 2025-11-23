package com.hemanth.chat_application.message;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request) {
        // Save message to database
        ChatMessageResponse response = messageService.saveMessage(request);

        // Send message to receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
                String.valueOf(request.getReceiverId()),
                "/queue/messages",
                response
        );

        // Send confirmation back to sender
        messagingTemplate.convertAndSendToUser(
                String.valueOf(request.getSenderId()),
                "/queue/messages",
                response
        );
    }

    @MessageMapping("/chat.delivered")
    public void markAsDelivered(@Payload MessageNotification notification) {
        messageService.markAsDelivered(notification.getMessageId());

        // Notify sender that message was delivered
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notification.getSenderId()),
                "/queue/notifications",
                MessageNotification.builder()
                        .messageId(notification.getMessageId())
                        .status(MessageStatus.DELIVERED)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @MessageMapping("/chat.read")
    public void markAsRead(@Payload MessageNotification notification) {
        messageService.markAsRead(notification.getMessageId());

        // Notify sender that message was read
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notification.getSenderId()),
                "/queue/notifications",
                MessageNotification.builder()
                        .messageId(notification.getMessageId())
                        .status(MessageStatus.READ)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @MessageMapping("/chat.typing")
    public void userTyping(@Payload TypingNotification notification) {
        // Send typing notification to receiver
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notification.getReceiverId()),
                "/queue/typing",
                notification
        );
    }
}