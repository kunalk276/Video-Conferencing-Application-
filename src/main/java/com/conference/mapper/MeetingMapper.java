package com.conference.mapper;

import com.conference.dto.MeetingDTO;
import com.conference.model.Meeting;
import com.conference.model.User;

public class MeetingMapper {

    public static MeetingDTO toDTO(Meeting meeting) {
        if (meeting == null) return null;
        return MeetingDTO.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .meetingCode(meeting.getMeetingCode())
                .startTime(meeting.getStartTime())
                .hostId(meeting.getHost() != null ? meeting.getHost().getId() : null)
                .build();
    }

    public static Meeting toEntity(MeetingDTO dto, User host) {
        if (dto == null) return null;
        return Meeting.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .meetingCode(dto.getMeetingCode())
                .startTime(dto.getStartTime())
                .host(host)
                .build();
    }
}
