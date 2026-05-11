package br.com.dinacare.domain.client;

import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank String name,
        @NotBlank String phone,
        String notes
) {}