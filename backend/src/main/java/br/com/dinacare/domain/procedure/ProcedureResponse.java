package br.com.dinacare.domain.procedure;

import java.math.BigDecimal;
import java.util.UUID;

public record ProcedureResponse(
        UUID id,
        String name,
        Integer duration,
        BigDecimal price,
        Boolean active
) {
}
