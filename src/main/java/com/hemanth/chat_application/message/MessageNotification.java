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
public class MessageNotification {
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private MessageStatus status;
    private LocalDateTime timestamp;
}