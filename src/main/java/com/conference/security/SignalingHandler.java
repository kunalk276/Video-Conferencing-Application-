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
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
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
        String room = node.has("roomId") ? node.get("roomId").asText() : "default";
        String sender = node.has("sender") ? node.get("sender").asText() : null;
        String target = node.has("target") ? node.get("target").asText() : null;

        rooms.putIfAbsent(room, new ArrayList<>());
        List<WebSocketSession> sessionList = rooms.get(room);

        switch (type) {
            case "join":
                if (!sessionList.contains(session)) {
                    sessionList.add(session);
                    sessionUserMap.put(session.getId(), sender);
                }

                boolean isInitiator = sessionList.size() == 1;

                Map<String, Object> joinResponse = new HashMap<>();
                joinResponse.put("type", "join");
                joinResponse.put("initiator", isInitiator);
                session.sendMessage(new TextMessage(mapper.writeValueAsString(joinResponse)));
                break;

            case "offer":
            case "answer":
            case "ice-candidate":
                for (WebSocketSession s : sessionList) {
                    String targetId = sessionUserMap.get(s.getId());
                    if (targetId != null && targetId.equals(target) && s.isOpen()) {
                        s.sendMessage(new TextMessage(payload));
                        break;
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
        sessionUserMap.remove(session.getId());
        System.out.println("Connection closed: " + session.getId());
    }
}
