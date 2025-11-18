package com.hemanth.chat_application.otp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpTokenRepository otpTokenRepository;
    private final Random random = new Random();

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MIN = 10;
    private static final int MAX_OTPS_PER_HOUR = 5;

    public String generateOtpString() {
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        int val = random.nextInt(max - min + 1) + min;
        return String.valueOf(val);
    }

    public OtpToken createAndSaveOtp(String email, Purpose purpose) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<OtpToken> recent = otpTokenRepository.findByEmailAndCreatedAtAfter(email, oneHourAgo);
        if(recent.size() >= MAX_OTPS_PER_HOUR) {
            throw new IllegalStateException("Too many OTP requests. Try again later.");
        }

        String otp = generateOtpString();
        OtpToken token = OtpToken.builder()
                .email(email)
                .otp(otp)
                .purpose(purpose)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MIN))
                .used(false)
                .build();

        return otpTokenRepository.save(token);
    }

    public boolean verifyOtp(String email, String otp, Purpose purpose) {
        // Fixed method call - corrected method name
        var opt = otpTokenRepository.findTopByEmailAndOtpAndPurposeOrderByCreatedAtDesc(email, otp, purpose);
        if (opt.isEmpty()) return false;
        OtpToken token = opt.get();

        if (token.isUsed()) return false;
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) return false;

        token.setUsed(true);
        otpTokenRepository.save(token);
        return true;
    }
}