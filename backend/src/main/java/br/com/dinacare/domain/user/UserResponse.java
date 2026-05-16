package br.com.dinacare.domain.user;

import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String login,
        UserRole userRole,
        LocalTime entryTime,
        LocalTime exitTime,
        LocalTime lunchStartTime,
        LocalTime lunchEndTime,
        Set<WorkDays> workDays,
        String especialidade,
        String bio,
        String endereco,
        Boolean active
) {}