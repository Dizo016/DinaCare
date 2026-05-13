package br.com.dinacare.infra.security;

import br.com.dinacare.domain.user.User;
import br.com.dinacare.infra.security.jwt.JwtService;
import br.com.dinacare.infra.security.jwt.TokenResponse;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public TokenResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.login(), request.password())
        );

        User user = userRepository.findByLogin(request.login())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String token = jwtService.generateToken(user.getLogin(), user.getUserRole().name());

        return TokenResponse.of(token, user.getLogin(), user.getUserRole().name());
    }
}