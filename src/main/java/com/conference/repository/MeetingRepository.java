package com.conference.repository;

import com.conference.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    boolean existsByMeetingCode(String meetingCode);
    Optional<Meeting> findByMeetingCodeAndDeletedFalse(String meetingCode);

}
