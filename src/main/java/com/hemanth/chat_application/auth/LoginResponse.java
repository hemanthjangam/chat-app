package com.hemanth.chat_application.auth;

import com.hemanth.chat_application.user.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String email;
    private String username;
    private String profilePicture;
    private String bio;
    private String status;
    private Boolean isActive;

    public LoginResponse(boolean success, String message, User user) {
        this.success = success;
        this.message = message;
        this.userId = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.profilePicture = user.getProfilePicture();
        this.bio = user.getBio();
        this.status = user.getStatus() != null ? user.getStatus().toString() : null;
        this.isActive = user.getIsActive();
    }
}
