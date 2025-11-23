package com.hemanth.chat_application.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
public class HttpHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {

        // Extract userId from query parameters
        String query = request.getURI().getQuery();
        if (query != null && query.contains("userId=")) {
            String userId = extractUserId(query);
            if (userId != null && !userId.isEmpty()) {
                attributes.put("userId", userId);
                log.info("WebSocket handshake: userId={}", userId);
                return true;
            }
        }

        log.warn("WebSocket handshake rejected: No userId provided");
        return false; // Reject connection if no userId
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // Nothing to do after handshake
    }

    private String extractUserId(String query) {
        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && "userId".equals(keyValue[0])) {
                return keyValue[1];
            }
        }
        return null;
    }
}