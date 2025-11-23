package com.hemanth.chat_application.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
            "AND m.isDeleted = false ORDER BY m.sentAt DESC")
    Page<Message> findConversationBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2,
            Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :receiverId " +
            "AND m.status != 'READ' AND m.isDeleted = false")
    List<Message> findUnreadMessagesByReceiver(@Param("receiverId") Long receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId " +
            "AND m.senderId = :senderId AND m.status != 'READ' AND m.isDeleted = false")
    Long countUnreadMessagesBetweenUsers(
            @Param("receiverId") Long receiverId,
            @Param("senderId") Long senderId);

    @Query("SELECT m FROM Message m WHERE m.receiverId = :receiverId " +
            "AND m.senderId = :senderId AND m.status != 'READ' AND m.isDeleted = false")
    List<Message> findUnreadMessagesBetweenUsers(
            @Param("receiverId") Long receiverId,
            @Param("senderId") Long senderId);
}