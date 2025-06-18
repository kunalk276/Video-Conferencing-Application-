package com.conference.mapper;

import com.conference.dto.MessageDTO;
import com.conference.model.Message;
import com.conference.model.User;
import com.conference.model.Meeting;

public class MessageMapper {

    public static MessageDTO toDTO(Message message) {
        if (message == null) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .meetingId(message.getMeeting() != null ? message.getMeeting().getId() : null)
                .build();
    }

    public static Message toEntity(MessageDTO dto, User sender, Meeting meeting) {
        if (dto == null) return null;
        return Message.builder()
                .id(dto.getId())
                .content(dto.getContent())
                .timestamp(dto.getTimestamp())
                .sender(sender)
                .meeting(meeting)
                .build();
    }
}
