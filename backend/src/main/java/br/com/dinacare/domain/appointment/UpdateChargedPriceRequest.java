package br.com.dinacare.domain.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateChargedPriceRequest(
        @NotNull @Positive BigDecimal chargedPrice
) {
}