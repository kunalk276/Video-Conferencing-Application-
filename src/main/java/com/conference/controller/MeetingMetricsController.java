package com.conference.controller;

import com.conference.security.WebSocketTracker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/meetings")
public class MeetingMetricsController {

@Autowired
    private WebSocketTracker tracker;

@GetMapping("/{meetingId}/active-users")
    public int getActiveUsers(@PathVariable String meetingId)
    {
        return tracker.getUserCount(meetingId);
    }

    @GetMapping("/all-status")
    public Map<String, Integer> getAllMeetingsStatus()
    {
        return tracker.getAllmeetingsStatus();
    }
}
