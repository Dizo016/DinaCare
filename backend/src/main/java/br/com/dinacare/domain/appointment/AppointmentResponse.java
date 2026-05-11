package br.com.dinacare.domain.appointment;

import br.com.dinacare.domain.client.ClientResponse;
import br.com.dinacare.domain.procedure.ProcedureResponse;
import br.com.dinacare.domain.user.UserResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UserResponse user,
        ClientResponse client,
        ProcedureResponse procedure,
        Integer duration,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus appointmentStatus,
        PaymentStatus paymentStatus,
        BigDecimal chargedPrice,
        String notes,
        Instant createdAt
) {
}
