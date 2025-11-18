package com.hemanth.chat_application.otp;

import jakarta.persistence.*;
import lombok.*;

import javax.xml.crypto.KeySelector;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "otp_tokens", indexes = {
        @Index(columnList = "email"),
        @Index(columnList = "createdAt")
})
public class OtpToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otp;

    private LocalDateTime expiresAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private Purpose purpose;

    @Builder.Default
    private boolean used = false;
}
