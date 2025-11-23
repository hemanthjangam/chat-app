package com.hemanth.chat_application.user;

import com.hemanth.chat_application.otp.OtpService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final OtpService otpService;

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public void registerUserAfterOtpVerified(String email, String username) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email already registered");
        }
        User user = User.builder()
                .email(email)
                .username(username)
                .isActive(true)
                .status(null)
                .build();

        userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .status(user.getStatus() != null ? user.getStatus().toString() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .lastSeen(user.getLastSeen())
                .build();
    }
}
