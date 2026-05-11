package br.com.dinacare.domain.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentRequest(
        @NotNull UUID userId,
        @NotNull UUID clientId,
        @NotNull UUID procedureId,
        @NotNull LocalDateTime startTime,
        @NotNull @Positive BigDecimal chargedPrice,
        String notes
        ) {
}
