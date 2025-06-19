package com.conference.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingDTO {
    private Long id;
    private String title;
    private String meetingCode;
    private LocalDateTime startTime;
    private Long hostId;
    private String hostName;
}
