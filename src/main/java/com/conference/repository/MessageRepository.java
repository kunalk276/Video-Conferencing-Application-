package com.conference.repository;

import com.conference.model.Message;
import com.conference.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByMeeting(Meeting meeting);
}
