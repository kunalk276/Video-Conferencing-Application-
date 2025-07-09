package com.conference.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SignalingHandler signalingHandler;

    // Constructor injection of SignalingHandler
    public WebSocketConfig(SignalingHandler signalingHandler) {
        this.signalingHandler = signalingHandler;
    }

    // Register WebSocket handler and configure allowed origins
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {

        registry.addHandler(signalingHandler, "/ws/signaling")
                .setAllowedOrigins("*");
                //.withSockJS()
    }

    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
