package br.com.dinacare.infra.security.jwt;

public record TokenResponse(
        String token,
        String type,
        String login,
        String role
) {
    public static TokenResponse of(String token, String login, String role) {
        return new TokenResponse(token, "Bearer", login, role);
    }
}