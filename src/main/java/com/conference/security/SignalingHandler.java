package com.conference.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, List<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("New WebSocket connection: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Received: " + payload);

        JsonNode node = mapper.readTree(payload);
        String type = node.get("type").asText();
        String room = node.has("room") ? node.get("room").asText() : "default";
        JsonNode data = node.get("data");

        rooms.putIfAbsent(room, new ArrayList<>());
        List<WebSocketSession> sessionList = rooms.get(room);

        switch (type) {
            case "join":
                if (!sessionList.contains(session)) {
                    sessionList.add(session);
                }

                boolean isInitiator = sessionList.size() == 1;

                // Send back role to joining client
                Map<String, Object> joinResponse = new HashMap<>();
                joinResponse.put("type", "join");
                joinResponse.put("initiator", isInitiator);
                session.sendMessage(new TextMessage(mapper.writeValueAsString(joinResponse)));

                break;

            case "offer":
            case "answer":
            case "candidate":
                // Broadcast to all others in the room
                for (WebSocketSession s : sessionList) {
                    if (!s.getId().equals(session.getId()) && s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                    }
                }
                break;

            default:
                System.out.println("Unknown message type: " + type);
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        for (List<WebSocketSession> sessionList : rooms.values()) {
            sessionList.remove(session);
        }
        System.out.println("Connection closed: " + session.getId());
    }
}
