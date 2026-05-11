package br.com.dinacare.domain.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.Set;

public record UserRequest(
        @NotBlank String name,
        @NotBlank String login,
        @NotBlank String password,
        @NotNull UserRole userRole,
        @NotNull LocalTime entryTime,
        @NotNull LocalTime exitTime,
        LocalTime lunchStartTime,
        LocalTime lunchEndTime,
        @NotNull Set<WorkDays> workDays
) {}