package com.conference.service;

import com.conference.dto.MeetingDTO;
import com.conference.mapper.MeetingMapper;
import com.conference.model.Meeting;
import com.conference.model.User;
import com.conference.repository.MeetingRepository;
import com.conference.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public List<MeetingDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .filter(m -> !m.isDeleted())
                .map(MeetingMapper::toDTO)
                .collect(Collectors.toList());
    }

    public MeetingDTO getMeetingById(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return MeetingMapper.toDTO(meeting);
    }

    public MeetingDTO createMeeting(MeetingDTO meetingDTO) {
        User host = userRepository.findById(meetingDTO.getHostId())
                .orElseThrow(() -> new RuntimeException("Host user not found"));

        Meeting meeting = MeetingMapper.toEntity(meetingDTO, host);
        return MeetingMapper.toDTO(meetingRepository.save(meeting));
    }

    public void softDeleteMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setDeleted(true);
        meetingRepository.save(meeting);
    }
}
