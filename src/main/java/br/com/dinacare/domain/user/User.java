package br.com.dinacare.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String login;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    @Column(nullable = false, name = "entry_time")
    private LocalTime entryTime;

    @Column(nullable = false, name = "exit_time")
    private LocalTime exitTime;

    @Column(name = "lunch_start_time")
    private LocalTime lunchStartTime;

    @Column(name = "lunch_end_time")
    private LocalTime lunchEndTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_work_days",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "work_days", nullable = false)
    private Set<WorkDays> workDays;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

}
