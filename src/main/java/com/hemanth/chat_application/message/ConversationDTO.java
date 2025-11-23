package com.hemanth.chat_application.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDTO {
    private Long otherUserId;
    private String otherUserEmail;
    private String otherUsername;
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;
    private String otherUserStatus;
}