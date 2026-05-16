package br.com.dinacare.domain.user;

public record UpdateProfileRequest(
        String especialidade,
        String bio,
        String endereco
) {}