package com.hemanth.chat_application.message;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    @Transactional
    public ChatMessageResponse saveMessage(ChatMessageRequest request) {
        Message message = Message.builder()
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .isDeleted(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        return toResponse(savedMessage);
    }

    @Transactional
    public void markAsDelivered(Long messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            if (message.getStatus() == MessageStatus.SENT) {
                message.setStatus(MessageStatus.DELIVERED);
                message.setDeliveredAt(LocalDateTime.now());
                messageRepository.save(message);
            }
        });
    }

    @Transactional
    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            if (message.getStatus() != MessageStatus.READ) {
                message.setStatus(MessageStatus.READ);
                message.setReadAt(LocalDateTime.now());
                if (message.getDeliveredAt() == null) {
                    message.setDeliveredAt(LocalDateTime.now());
                }
                messageRepository.save(message);
            }
        });
    }

    @Transactional
    public void markConversationAsRead(Long receiverId, Long senderId) {
        List<Message> unreadMessages = messageRepository
                .findUnreadMessagesBetweenUsers(receiverId, senderId);

        LocalDateTime now = LocalDateTime.now();
        unreadMessages.forEach(message -> {
            message.setStatus(MessageStatus.READ);
            message.setReadAt(now);
            if (message.getDeliveredAt() == null) {
                message.setDeliveredAt(now);
            }
        });

        messageRepository.saveAll(unreadMessages);
    }

    public Page<ChatMessageResponse> getConversation(Long userId1, Long userId2, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentAt").descending());
        Page<Message> messages = messageRepository.findConversationBetweenUsers(userId1, userId2, pageable);
        return messages.map(this::toResponse);
    }

    public List<ChatMessageResponse> getUnreadMessages(Long receiverId) {
        return messageRepository.findUnreadMessagesByReceiver(receiverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount(Long receiverId, Long senderId) {
        return messageRepository.countUnreadMessagesBetweenUsers(receiverId, senderId);
    }

    private ChatMessageResponse toResponse(Message message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .status(message.getStatus())
                .sentAt(message.getSentAt())
                .deliveredAt(message.getDeliveredAt())
                .readAt(message.getReadAt())
                .build();
    }
}