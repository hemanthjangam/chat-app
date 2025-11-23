package com.hemanth.chat_application.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TypingNotification {
    private Long senderId;
    private Long receiverId;
    private Boolean isTyping;
}