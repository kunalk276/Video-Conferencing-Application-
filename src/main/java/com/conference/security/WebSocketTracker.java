package com.conference.security;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketTracker {

    private final Map<String, Set<String>> meetingUsers = new ConcurrentHashMap<>();

    public Boolean addUser(String meetingId, String sessionId)
    {
        meetingUsers.putIfAbsent(meetingId,ConcurrentHashMap.newKeySet());

        Set<String>users=meetingUsers.get(meetingId);
        if(users.size()>=100)
        {
            return false;
        }
        users.add(sessionId);
        return true;
    }
    public void removerUser(String meetingId, String sessionId)
    {
        Set<String>users=meetingUsers.get(meetingId);
        if(users !=null)
        {
            users.remove(sessionId);
        }
    }
    public  int getUserCount(String meetingId)
    {
        return meetingUsers.getOrDefault(meetingId, Set.of()).size();
    }
    public Map<String, Integer>getAllmeetingsStatus()
    {

        {
            Map<String, Integer> status=new ConcurrentHashMap<>();
            for(var entry: meetingUsers.entrySet())
            {
                status.put(entry.getKey(),
                entry.getValue().size());
            }
            return status;
        }
    }
}
