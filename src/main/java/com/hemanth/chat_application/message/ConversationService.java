package com.hemanth.chat_application.message;

import com.hemanth.chat_application.user.User;
import com.hemanth.chat_application.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<ConversationDTO> getUserConversations(Long userId) {
        // Get all messages where user is either sender or receiver
        List<Message> allMessages = messageRepository.findAll();

        // Filter messages involving this user
        List<Message> userMessages = allMessages.stream()
                .filter(m -> m.getSenderId().equals(userId) || m.getReceiverId().equals(userId))
                .filter(m -> !m.getIsDeleted())
                .collect(Collectors.toList());

        // Group by conversation partner
        Map<Long, List<Message>> conversationMap = new HashMap<>();
        for (Message message : userMessages) {
            Long otherUserId = message.getSenderId().equals(userId)
                    ? message.getReceiverId()
                    : message.getSenderId();

            conversationMap.computeIfAbsent(otherUserId, k -> new ArrayList<>()).add(message);
        }

        // Build conversation DTOs
        List<ConversationDTO> conversations = new ArrayList<>();
        for (Map.Entry<Long, List<Message>> entry : conversationMap.entrySet()) {
            Long otherUserId = entry.getKey();
            List<Message> messages = entry.getValue();

            // Get the most recent message
            Message lastMessage = messages.stream()
                    .max((m1, m2) -> m1.getSentAt().compareTo(m2.getSentAt()))
                    .orElse(null);

            if (lastMessage != null) {
                // Get unread count
                Long unreadCount = messageRepository.countUnreadMessagesBetweenUsers(userId, otherUserId);

                // Get other user info
                User otherUser = userRepository.findById(otherUserId).orElse(null);

                if (otherUser != null) {
                    ConversationDTO dto = ConversationDTO.builder()
                            .otherUserId(otherUserId)
                            .otherUserEmail(otherUser.getEmail())
                            .otherUsername(otherUser.getUsername())
                            .lastMessageContent(lastMessage.getContent())
                            .lastMessageTime(lastMessage.getSentAt())
                            .unreadCount(unreadCount)
                            .otherUserStatus(otherUser.getStatus() != null ? otherUser.getStatus().name() : "OFFLINE")
                            .build();

                    conversations.add(dto);
                }
            }
        }

        // Sort by last message time (most recent first)
        conversations.sort((c1, c2) -> c2.getLastMessageTime().compareTo(c1.getLastMessageTime()));

        return conversations;
    }
}