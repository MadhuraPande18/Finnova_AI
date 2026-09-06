package com.javatodev.finance.auth_service.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET =
            "my-super-secret-key-for-banking-system-2026";

    public String generateToken(String username) {

        SecretKey key = Keys.hmacShaKeyFor(
                SECRET.getBytes(StandardCharsets.UTF_8)
        );

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(key)
                .compact();
    }
}