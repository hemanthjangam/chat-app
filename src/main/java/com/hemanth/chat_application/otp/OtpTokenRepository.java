package com.hemanth.chat_application.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    List<OtpToken> findByEmailAndCreatedAtAfter(String email, LocalDateTime after);

    @Query("SELECT o FROM OtpToken o WHERE o.email = :email AND o.otp = :otp AND o.purpose = :purpose ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpToken> findTopByEmailAndOtpAndPurposeOrderByCreatedAtDesc(
            @Param("email") String email,
            @Param("otp") String otp,
            @Param("purpose") Purpose purpose);

    List<OtpToken> findByEmailAndUsedFalseAndExpiresAtAfter(String email, LocalDateTime time);
}