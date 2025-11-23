package com.hemanth.chat_application.auth;

import com.hemanth.chat_application.email.EmailService;
import com.hemanth.chat_application.otp.OtpService;
import com.hemanth.chat_application.otp.Purpose;
import com.hemanth.chat_application.otp.SendOtpRequest;
import com.hemanth.chat_application.otp.VerifyOtpRequest;
import com.hemanth.chat_application.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserService userService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Purpose purpose = Purpose.valueOf(request.getPurpose().toUpperCase().trim());

        if (purpose == Purpose.REGISTER && userService.emailExists(email)) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email already registered"));
        }

        if (purpose == Purpose.LOGIN && !userService.emailExists(email)) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email not registered"));
        }

        var token = otpService.createAndSaveOtp(email, purpose);

        emailService.sendOtpEmail(email, token.getOtp(), purpose.name());
        return ResponseEntity.ok(new ApiResponse(true, "OTP sent to email"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Purpose purpose = Purpose.valueOf(request.getPurpose().toUpperCase().trim());

        boolean ok = otpService.verifyOtp(email, request.getOtp(), purpose);

        if (!ok) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid or expired OTP"));
        }

        if (purpose == Purpose.REGISTER) {
            userService.registerUserAfterOtpVerified(request.getEmail(), request.getUsername());
            return ResponseEntity.ok(new ApiResponse(true, "Registration successful"));
        } else {
            // For LOGIN, return user data
            var user = userService.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            return ResponseEntity.ok(new LoginResponse(true, "Login successful", user));
        }
    }
}
