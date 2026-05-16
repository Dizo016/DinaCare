package br.com.dinacare.domain.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record PublicAppointmentRequest(
        @NotNull UUID profissionalId,
        @NotNull UUID procedureId,
        @NotNull LocalDateTime startTime,
        @NotBlank String clientName,
        @NotBlank String clientPhone
) {
}