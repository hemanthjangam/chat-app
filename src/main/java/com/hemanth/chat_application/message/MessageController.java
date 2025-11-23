package com.hemanth.chat_application.message;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;
    private final ConversationService conversationService;

    @GetMapping("/conversation")
    public ResponseEntity<Page<ChatMessageResponse>> getConversation(
            @RequestParam Long userId1,
            @RequestParam Long userId2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<ChatMessageResponse> messages = messageService.getConversation(userId1, userId2, page, size);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageResponse>> getUnreadMessages(
            @RequestParam Long receiverId) {

        List<ChatMessageResponse> unreadMessages = messageService.getUnreadMessages(receiverId);
        return ResponseEntity.ok(unreadMessages);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestParam Long receiverId,
            @RequestParam Long senderId) {

        Long count = messageService.getUnreadCount(receiverId, senderId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/conversation/read")
    public ResponseEntity<Void> markConversationAsRead(
            @RequestParam Long receiverId,
            @RequestParam Long senderId) {

        messageService.markConversationAsRead(receiverId, senderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(
            @RequestParam Long userId) {

        List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }
}