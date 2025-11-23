package com.hemanth.chat_application.websocket;

import com.hemanth.chat_application.user.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusNotification {
    private Long userId;
    private Status status;
    private LocalDateTime timestamp;
}