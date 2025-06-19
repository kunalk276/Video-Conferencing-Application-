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


                for (WebSocketSession s : sessionList) {
                    if (!s.getId().equals(session.getId()) && s.isOpen()) {
                        Map<String, Object> joinNotification = new HashMap<>();
                        joinNotification.put("type", "join");
                        joinNotification.put("sender", sender);
                        joinNotification.put("roomId", room);
                        s.sendMessage(new TextMessage(mapper.writeValueAsString(joinNotification)));
                    }
                }


                Map<String, Object> joinAck = new HashMap<>();
                joinAck.put("type", "join-ack");
                joinAck.put("roomId", room);
                joinAck.put("sender", sender);
                session.sendMessage(new TextMessage(mapper.writeValueAsString(joinAck)));

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

            case "user-left":

                for (WebSocketSession s : sessionList) {
                    if (!s.getId().equals(session.getId()) && s.isOpen()) {
                        Map<String, Object> leaveMessage = new HashMap<>();
                        leaveMessage.put("type", "user-left");
                        leaveMessage.put("sender", sender);
                        leaveMessage.put("roomId", room);
                        s.sendMessage(new TextMessage(mapper.writeValueAsString(leaveMessage)));
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
        String sender = sessionUserMap.remove(session.getId());

        for (Map.Entry<String, List<WebSocketSession>> entry : rooms.entrySet()) {
            List<WebSocketSession> sessionList = entry.getValue();
            sessionList.remove(session);


            if (sender != null) {
                for (WebSocketSession s : sessionList) {
                    if (s.isOpen()) {
                        Map<String, Object> leaveMessage = new HashMap<>();
                        leaveMessage.put("type", "user-left");
                        leaveMessage.put("sender", sender);
                        leaveMessage.put("roomId", entry.getKey());
                        try {
                            s.sendMessage(new TextMessage(mapper.writeValueAsString(leaveMessage)));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }

        System.out.println("Connection closed: " + session.getId());
    }

}
