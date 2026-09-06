package com.javatodev.finance.auth_service.controller;

import com.javatodev.finance.auth_service.client.AccountClient;
import com.javatodev.finance.auth_service.entity.AuthUser;
import com.javatodev.finance.auth_service.repository.AuthUserRepository;
import com.javatodev.finance.auth_service.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthUserRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AccountClient accountClient;

    public AuthController(AuthUserRepository repository,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder,
                          AccountClient accountClient) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.accountClient = accountClient;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthUser user) {
        if (user.getUsername() == null || user.getUsername().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        if (repository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        AuthUser saved = repository.save(user);

        // Give every new user a real, zero-balance account in core-banking-service
        // so the dashboard has genuine data to show instead of nothing/fake arrays.
        // If core-banking-service happens to be down, registration still succeeds —
        // the account can be provisioned/retried later rather than blocking signup.
        try {
            accountClient.createAccount(new AccountClient.NewAccountRequest(
                    null, // let core-banking-service generate the account number
                    saved.getUsername(),
                    0.0,
                    saved.getUsername()
            ));
        } catch (Exception ex) {
            System.out.println("Warning: could not auto-provision account for "
                    + saved.getUsername() + " - core-banking-service may be down: " + ex.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthUser user) {
        AuthUser existingUser = repository.findByUsername(user.getUsername()).orElse(null);

        if (existingUser == null || !passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password"));
        }

        String token = jwtService.generateToken(existingUser.getUsername());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", existingUser.getUsername()
        ));
    }
}
