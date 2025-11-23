package com.hemanth.chat_application.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

@Slf4j
public class UserInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get userId from session attributes (set during HTTP handshake)
            Object userId = accessor.getSessionAttributes().get("userId");

            if (userId != null) {
                UserPrincipal principal = new UserPrincipal(userId.toString());
                accessor.setUser(principal);
                log.info("User principal set for userId: {}", userId);
            } else {
                log.warn("No userId found in session attributes");
            }
        }

        return message;
    }
}