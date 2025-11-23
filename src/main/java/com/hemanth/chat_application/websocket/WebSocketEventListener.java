package com.hemanth.chat_application.websocket;

import com.hemanth.chat_application.user.Status;
import com.hemanth.chat_application.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    // Track active sessions: userId -> sessionId
    private final Map<Long, String> activeSessions = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        // Get Principal (set by UserInterceptor)
        if (headerAccessor.getUser() != null) {
            UserPrincipal principal = (UserPrincipal) headerAccessor.getUser();
            Long userId = principal.getUserIdAsLong();

            activeSessions.put(userId, sessionId);

            // Update user status to ONLINE
            updateUserStatus(userId, Status.ONLINE);

            // Broadcast user online status
            broadcastUserStatus(userId, Status.ONLINE);

            log.info("User {} connected with session {}", userId, sessionId);
        } else {
            log.warn("Connected without principal - sessionId: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Get Principal
        if (headerAccessor.getUser() != null) {
            UserPrincipal principal = (UserPrincipal) headerAccessor.getUser();
            Long userId = principal.getUserIdAsLong();

            activeSessions.remove(userId);

            // Update user status to OFFLINE
            updateUserStatus(userId, Status.OFFLINE);

            // Broadcast user offline status
            broadcastUserStatus(userId, Status.OFFLINE);

            log.info("User {} disconnected", userId);
        }
    }

    private void updateUserStatus(Long userId, Status status) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setStatus(status);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    private void broadcastUserStatus(Long userId, Status status) {
        UserStatusNotification notification = UserStatusNotification.builder()
                .userId(userId)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/user-status", notification);
    }

    public boolean isUserOnline(Long userId) {
        return activeSessions.containsKey(userId);
    }
}