package api_gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class JwtAuthenticationFilter implements WebFilter {

    private final String SECRET =
            "my-super-secret-key-for-banking-system-2026";

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            WebFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        // Let CORS preflight requests through — browsers send OPTIONS without
        // an Authorization header, so this filter must not block them or
        // every cross-origin call from the frontend will fail before the
        // real request is ever sent.
        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Auth endpoints do not need JWT
        if (path.startsWith("/auth")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(
                    HttpStatus.UNAUTHORIZED
            );
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            SecretKey key = Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );

            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            exchange = exchange.mutate()
                    .request(request -> request.header(
                            "X-Username",
                            claims.getSubject()
                    ))
                    .build();

            return chain.filter(exchange);

        } catch (Exception e) {

            System.out.println("JWT validation failed: "
                    + e.getClass().getName()
                    + " - "
                    + e.getMessage());

            exchange.getResponse().setStatusCode(
                    HttpStatus.UNAUTHORIZED
            );

            return exchange.getResponse().setComplete();
        }
    }
}