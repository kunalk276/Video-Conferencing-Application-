package com.conference.security;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@ServerEndpoint("/wss/signaling/{meetingId}")
@Component
public class MeetingWebSocketHandler {

    private static WebSocketTracker tracker;

    @Autowired
    public void  setTracker(WebSocketTracker webSocketTracker)
    {
        MeetingWebSocketHandler.tracker= webSocketTracker;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("meetingId") String meetingId) throws Exception
    {
        boolean added = tracker.addUser(meetingId, session.getId());

        if(!added)
        {
            session.getBasicRemote().sendText("Room full. MAX 100 participants allowed.");
            session.close();
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("meetingId")
                        String meetingId)
    {
        tracker.removerUser(meetingId, session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable)
    {
        System.err.println("WebSocket Error: "+ throwable.getMessage());
    }
    @OnMessage
    public void onMessage(String message, Session session)
    {

    }
}
