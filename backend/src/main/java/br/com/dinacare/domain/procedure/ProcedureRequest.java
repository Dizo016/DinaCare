package br.com.dinacare.domain.procedure;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProcedureRequest(
        @NotBlank String name,
        @NotNull @Positive Integer duration,
        @NotNull @Positive BigDecimal price
        ) {
}
