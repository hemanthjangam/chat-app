package com.hemanth.chat_application.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private String profilePicture;
    private String bio;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeen;
}
