package com.conference.controller;

import com.conference.dto.MessageDTO;
import com.conference.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {"http://localhost:3000" ,"https://video-conferencing-application-taupe.vercel.app"})
@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByMeetingId(@PathVariable Long meetingId) {
        return ResponseEntity.ok(messageService.getMessagesByMeetingId(meetingId));
    }

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.sendMessage(messageDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteMessage(@PathVariable Long id) {
        messageService.softDeleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
