package com.hemanth.chat_application.otp;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String purpose;
    private String username;
}
