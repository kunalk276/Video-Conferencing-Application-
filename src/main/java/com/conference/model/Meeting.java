package com.conference.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting  extends Auditable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotBlank(message = "Meeting code is required")
    @Pattern(regexp = "^[A-Z0-9]{6,10}$", message = "Meeting code must be 6–10 uppercase letters or digits")
    private String meetingCode;

    @Column(nullable = false)
    private boolean deleted = false;


    @ManyToOne
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL)
    private List<Message> messages;
}
