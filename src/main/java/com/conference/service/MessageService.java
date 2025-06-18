package com.conference.service;

import com.conference.dto.MessageDTO;
import com.conference.mapper.MessageMapper;
import com.conference.model.Message;
import com.conference.model.User;
import com.conference.model.Meeting;
import com.conference.repository.MessageRepository;
import com.conference.repository.UserRepository;
import com.conference.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;

    public List<MessageDTO> getMessagesByMeetingId(Long meetingId) {
        return messageRepository.findAll().stream()
                .filter(m -> !m.isDeleted() && m.getMeeting().getId().equals(meetingId))
                .map(MessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public MessageDTO sendMessage(MessageDTO dto) {
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Meeting meeting = meetingRepository.findById(dto.getMeetingId())
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        Message message = MessageMapper.toEntity(dto, sender, meeting);
        return MessageMapper.toDTO(messageRepository.save(message));
    }

    public void softDeleteMessage(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeleted(true);
        messageRepository.save(message);
    }
}
