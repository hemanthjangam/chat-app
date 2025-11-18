package com.hemanth.chat_application.email;


import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp, String purpose) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Your OTP for " + purpose);
        msg.setText("Your OTP is: " + otp + "\n\nThis OTP will expire in 5 minutes. If you didn't request this, ignore.");
        mailSender.send(msg);
    }
}
