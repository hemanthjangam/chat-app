package com.hemanth.chat_application.user;

import com.hemanth.chat_application.otp.OtpService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final OtpService otpService;

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User registerUserAfterOtpVerified(String email, String username) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email already registered");
        }
        User user = User.builder()
                .email(email)
                .username(username)
                .isActive(true)
                .status(null)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
