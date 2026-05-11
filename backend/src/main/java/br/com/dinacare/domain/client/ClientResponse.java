package br.com.dinacare.domain.client;

import java.util.UUID;

public record ClientResponse(
        UUID id,
        String name,
        String phone,
        String notes,
        Boolean active
) {}