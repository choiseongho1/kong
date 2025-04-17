package com.diary.kong.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public TokenResponse createToken(String email) {
        String accessToken = generateAccessToken(email);
        String refreshToken = generateRefreshToken(email);

        redisTemplate.opsForValue()
            .set("RT:" + email, refreshToken, refreshTokenExpiration, TimeUnit.MILLISECONDS);

        return TokenResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build();
    }

    private String generateAccessToken(String email) {
        return Jwts.builder()
            .setSubject(email)
            .claim("email", email)
            .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(SignatureAlgorithm.HS256, secretKey)  // 디코딩 제거
            .compact();
    }

    private String generateRefreshToken(String email) {
        return Jwts.builder()
            .setSubject(email)
            .claim("email", email)
            .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
            .signWith(SignatureAlgorithm.HS256, secretKey)  // 디코딩 제거
            .compact();
    }

    public TokenResponse refreshToken(String refreshToken) {
        String email = getEmail(refreshToken);
        String savedRefreshToken = redisTemplate.opsForValue().get("RT:" + email);

        if (savedRefreshToken == null || !savedRefreshToken.equals(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String newAccessToken = generateAccessToken(email);
        String newRefreshToken = refreshToken;

        long remainingTime = redisTemplate.getExpire("RT:" + email, TimeUnit.MILLISECONDS);

        if (remainingTime < TimeUnit.DAYS.toMillis(3)) {
            newRefreshToken = generateRefreshToken(email);
            redisTemplate.opsForValue()
                .set("RT:" + email, newRefreshToken, refreshTokenExpiration, TimeUnit.MILLISECONDS);
        }

        return TokenResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .build();
    }

    public String getEmail(String token) {
        return extractClaims(token).get("email").toString();
    }

    public boolean isExpired(String token) {
        try {
            return extractClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(secretKey)  // 디코딩 제거
                .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
            .setSigningKey(secretKey)  // 디코딩 제거
            .parseClaimsJws(token)
            .getBody();
    }

    public void logout(String email) {
        redisTemplate.delete("RT:" + email);
    }
}
