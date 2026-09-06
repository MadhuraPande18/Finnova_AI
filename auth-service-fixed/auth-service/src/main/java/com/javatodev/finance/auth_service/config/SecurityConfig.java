package com.javatodev.finance.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Passwords were being stored and compared in plain text. That's a real
    // security bug in a "secure banking platform" — this is the standard fix.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // auth-service only has two real endpoints — register and login —
            // and both must be public (you can't authenticate your way into
            // getting a token). The JWT itself is verified downstream by the
            // gateway, not here, so there is nothing left in this service that
            // legitimately needs `.authenticated()`. Leaving that rule in
            // caused Spring Security's default Http403ForbiddenEntryPoint to
            // reject requests with a bare 403 before they ever reached the
            // controller.
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
