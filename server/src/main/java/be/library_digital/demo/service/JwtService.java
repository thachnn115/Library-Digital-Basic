package be.library_digital.demo.service;

import be.library_digital.demo.common.TokenType;
import be.library_digital.demo.exception.InvalidDataException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;


@Service
@Slf4j(topic = "JWT-SERVICE")
@RequiredArgsConstructor
public class JwtService {

//    private final BlackListTokenRepository blackListTokenRepository;

    @Value("${jwt.expiryMinutes}")
    private long EXPIRY_MINUTES;

    @Value("${jwt.expiryDay}")
    private long EXPIRY_DAY;

    @Value("${jwt.accessKey}")
    private String ACCESS_KEY;

    @Value("${jwt.refreshKey}")
    private String REFRESH_KEY;

    public String generateAccessToken(String userId, String username, Collection<? extends GrantedAuthority> authorities) {
        log.info("Generate access token for user {} with authorities {}", userId, authorities);
        Map<String, Object> claim = new HashMap<>();
        claim.put("userId", userId);

        List<String> authoritiesList = new ArrayList<>();
        authorities.forEach(authority -> authoritiesList.add(authority.getAuthority()));
        claim.put("role", authoritiesList);

        return generateAccessToken(claim, username);
    }

    public String generateRefreshToken(String userId, String username, Collection<? extends GrantedAuthority> authorities) {
        log.info("Generate refresh token for user {} with authorities {}", userId, authorities);


        Map<String, Object> claim = new HashMap<>();
        claim.put("userId", userId);
        claim.put("role", authorities);

        return generateRefreshToken(claim, username);
    }

    public String extractUsername(String token, TokenType type) {
        return extractClaim(token, type, Claims::getSubject);
    }

    public List<String> extractRole(String token, TokenType type){
        return extractClaim(token, type, claims -> {
            Object roles = claims.get("role");
            if (roles instanceof List<?>) {
                return ((List<?>) roles).stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .toList();
            }
            return Collections.emptyList();
        });
    }

    public boolean isTokenValid(String token, TokenType type, UserDetails userDetails) {
        final String username = extractUsername(token, type);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token, type);
    }

    public Date extractExpiration(String token, TokenType type) {
        return extractClaim(token, type, Claims::getExpiration);
    }

    public String extractTokenId(String token, TokenType type){
        return extractClaim(token, type, Claims::getId);
    }

    private boolean isTokenExpired(String token, TokenType type){
        return extractExpiration(token, type).before(new Date());
    }

    private <T> T extractClaim(String token, TokenType type, Function<Claims, T> claimsResolvers){
        final Claims claims = extractAllClaims(token, type);
        String tokenId = claims.getId();
//        if(blackListTokenRepository.existsById(tokenId)){
//            log.error("Token with id {} is blacklisted", tokenId);
//            throw new AccessDeniedException(
//                    String.format("Access denied! %s is blacklisted", type.toString())
//            );
//        }

        return claimsResolvers.apply(claims);
    }

    private Claims extractAllClaims(String token, TokenType type){
        try {
            log.info("Extract claims from token {} with type {}", token, type);
            return Jwts.parser()
                    .verifyWith(getSingingKey(type))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (SignatureException | ExpiredJwtException e) {
            log.error("Invalid JWT Token: {}", token);
            throw new AccessDeniedException("Access denied!, error: "+ e.getMessage());
        }
    }

    private String generateAccessToken(Map<String, Object> claims, String username) {
        log.info("Generate access token for user {}", username);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * EXPIRY_MINUTES))
                .signWith(getSingingKey(TokenType.ACCESS_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims, String username) {
        log.info("Generate refresh token for user {}", username);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * EXPIRY_DAY))
                .signWith(getSingingKey(TokenType.REFRESH_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String getSecretKey(TokenType type){
        switch (type) {
            case ACCESS_TOKEN -> {
                return ACCESS_KEY;
            }

            case REFRESH_TOKEN -> {
                return REFRESH_KEY;
            }

            default -> throw new InvalidDataException("Invalid token type");
        }
    }

    private SecretKey getSingingKey(TokenType type) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(getSecretKey(type)));
    }


}
