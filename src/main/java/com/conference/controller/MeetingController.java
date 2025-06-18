package com.conference.controller;

import com.conference.dto.MeetingDTO;
import com.conference.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000" ,"https://video-conferencing-application-taupe.vercel.app"})
@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping
    public ResponseEntity<List<MeetingDTO>> getAllMeetings() {
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingDTO> getMeetingById(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getMeetingById(id));
    }

    @PostMapping
    public ResponseEntity<MeetingDTO> createMeeting(@RequestBody MeetingDTO meetingDTO) {
        return ResponseEntity.ok(meetingService.createMeeting(meetingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteMeeting(@PathVariable Long id) {
        meetingService.softDeleteMeeting(id);
        return ResponseEntity.noContent().build();
    }
}
