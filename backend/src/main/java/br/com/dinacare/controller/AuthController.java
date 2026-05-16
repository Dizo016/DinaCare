package br.com.dinacare.controller;

import br.com.dinacare.domain.user.UserMapper;
import br.com.dinacare.domain.user.UserResponse;
import br.com.dinacare.infra.security.AuthService;
import br.com.dinacare.infra.security.LoginRequest;
import br.com.dinacare.infra.security.jwt.TokenResponse;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Principal principal) {
        return userRepository.findByLogin(principal.getName())
                .map(UserMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}