package com.hemanth.chat_application.otp;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String email;
    private String purpose;
    private String username;
}
