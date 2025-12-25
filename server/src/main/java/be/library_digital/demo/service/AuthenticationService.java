package be.library_digital.demo.service;

import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.dto.request.ForgotPasswordRequest;
import be.library_digital.demo.dto.request.ResetForgotPasswordRequest;
import be.library_digital.demo.dto.request.SignInRequest;
import be.library_digital.demo.dto.response.LoginResponse;
import be.library_digital.demo.dto.response.PublicUser;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.BlackListTokenRepository;
import be.library_digital.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTHENTICATION-SERVICE")
public class AuthenticationService {

    @Value("${jwt.expiryMinutes}")
    private long EXPIRY_MINUTES;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BlackListTokenRepository blackListTokenRepository;
    private final MailService mailService;

    @Value("${password-reset.expiry-minutes:30}")
    private long resetPasswordExpiryMinutes;

    @Value("${password-reset.base-url:http://localhost:5173/reset-password}")
    private String resetPasswordBaseUrl;

    public LoginResponse signIn(SignInRequest request) throws Exception {
        log.info("Log in account with username {}", request.getEmail());

        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && !be.library_digital.demo.common.UserType.ADMIN.equals(user.getType())) {
            // reset counter if new day
            if (user.getLastFailedLoginDate() != null && !user.getLastFailedLoginDate().isEqual(java.time.LocalDate.now())) {
                user.setFailedLoginAttempts(0);
                user.setLastFailedLoginDate(null);
                userRepository.save(user);
            }
            if (be.library_digital.demo.common.UserStatus.LOCK.equals(user.getStatus())) {
                throw new BadRequestException("Tài khoản đã bị khóa do đăng nhập sai nhiều lần, vui lòng liên hệ quản trị viên");
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));

            log.info("isAuthenticated: {}", authentication.isAuthenticated());
            log.info("Authorities: {}", authentication.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException e){
            log.error("Login failed");
            handleFailedLogin(user);
            throw new BadCredentialsException("Username or password is incorrect");
        }

        user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // success: reset failed attempts
        if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setLastFailedLoginDate(null);
            userRepository.save(user);
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), request.getEmail(), user.getAuthorities());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresIn(EXPIRY_MINUTES * 60 * 1000L)
                .user(PublicUser.fromUser(user))
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .build();

        // String uuidRandom = UUID.randomUUID().toString();
        // String sessionId = uuidRandom.substring(0, uuidRandom.length() - 6);
        // String otp = uuidRandom.substring(uuidRandom.length() - 6);

        // long otpExpiryMinutes = 15L;
        // user.setMfaSessionId(sessionId);
        // user.setMfaCode(passwordEncoder.encode(otp));
        // user.setMfaSessionExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));

        // userRepository.save(user);
        // mailService.sendOtp(user.getEmail(), user.getFullName(), otp, otpExpiryMinutes);

        // return SessionMFAResponse.builder()
        //         .sessionId(sessionId)
        //         .username(user.getEmail())
        //         .build();
    }

    // public LoginResponse getAccessToken(MFARequest request) {
    //     log.info("Get access token");
    //     log.info("Session ID: {}", request.getSessionId());

    //     User user = userRepository.findByEmail(request.getUsername())
    //             .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    //     String code = request.getOtp();

    //     if (user.getMfaSessionExpiry().isBefore(LocalDateTime.now())) {
    //         throw new BadCredentialsException("OTP expired");
    //     }

    //     if (!user.getMfaSessionId().equals(request.getSessionId())) {
    //         throw new BadCredentialsException("Invalid session");
    //     }

    //     if (!passwordEncoder.matches(code, user.getMfaCode())) {
    //         throw new BadCredentialsException("Invalid OTP");
    //     }

    //     user.setMfaSessionId(null);
    //     user.setMfaSessionExpiry(null);
    //     user.setMfaCode(null);

    //     String accessToken = jwtService.generateAccessToken(user.getId(), request.getUsername(), user.getAuthorities());
    //     userRepository.save(user);

    //     return LoginResponse.builder()
    //             .accessToken(accessToken)
    //             .expiresIn(EXPIRY_MINUTES * 60 * 1000L)
    //             .user(PublicUser.fromUser(user))
    //             .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
    //             .build();
    // }

    // public SessionMFAResponse resendOTP(MFARequest request) throws Exception {
    //     log.info("Get access token");
    //     log.info("Session ID: {}", request.getSessionId());

    //     User user = userRepository.findByEmail(request.getUsername())
    //             .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    //     if (!user.getMfaSessionId().equals(request.getSessionId())) {
    //         throw new BadCredentialsException("Invalid session");
    //     }

    //     if (user.getMfaSessionExpiry().isBefore(LocalDateTime.now())) {
    //         throw new BadCredentialsException("OTP expired");
    //     }

    //     String uuidRandom = UUID.randomUUID().toString();
    //     String sessionId = uuidRandom.substring(0, uuidRandom.length() - 6);
    //     String otp = uuidRandom.substring(uuidRandom.length() - 6);

    //     long otpExpiryMinutes = 15L;
    //     user.setMfaSessionId(sessionId);
    //     user.setMfaCode(passwordEncoder.encode(otp));
    //     user.setMfaSessionExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));

    //     userRepository.save(user);
    //     mailService.sendOtp(user.getEmail(), user.getFullName(), otp, otpExpiryMinutes);

    //     return SessionMFAResponse.builder()
    //             .sessionId(sessionId)
    //             .username(user.getEmail())
    //             .build();
    // }

    public void sendResetPasswordLink(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Password reset requested for {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        if (!UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new BadRequestException("User is not active");
        }

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(hash(token));
        user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(resetPasswordExpiryMinutes));
        user.setMustChangePassword(true);
        userRepository.save(user);

        String resetLink = UriComponentsBuilder.fromHttpUrl(resetPasswordBaseUrl)
                .queryParam("token", token)
                .toUriString();

        mailService.sendPasswordResetLink(user.getEmail(), user.getFullName(), resetLink, resetPasswordExpiryMinutes);
    }

    public void resetPassword(ResetForgotPasswordRequest request) {
        log.info("Resetting password via email link");
        String tokenHash = hash(request.getToken().trim());

        User user = userRepository.findByPasswordResetToken(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setMustChangePassword(false);
        user.setFailedLoginAttempts(0);
        user.setLastFailedLoginDate(null);
        userRepository.save(user);
    }

    private void handleFailedLogin(User user) {
        if (user == null) {
            return;
        }
        if (be.library_digital.demo.common.UserType.ADMIN.equals(user.getType())) {
            return; // do not lock admin
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        Integer attempts = user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0;
        if (user.getLastFailedLoginDate() == null || !today.equals(user.getLastFailedLoginDate())) {
            attempts = 0;
        }
        attempts += 1;
        user.setFailedLoginAttempts(attempts);
        user.setLastFailedLoginDate(today);
        if (attempts >= 10) {
            user.setStatus(be.library_digital.demo.common.UserStatus.LOCK);
        }
        userRepository.save(user);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashedBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to hash token", e);
        }
    }

//    @Transactional(rollbackFor = Exception.class)
//    public void signOut(String accessToken, String refreshToken, User user) {
//        log.info("Sign out account with username: {}", user.getUsername());
//        String usernameFromRT = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);
//
//        if(!Objects.equals(user.getUsername(), usernameFromRT)){
//            throw new BadRequestException("");
//        }
//
//        BlackListToken blackListRT = BlackListToken.builder()
//                .id(jwtService.extractTokenId(refreshToken, TokenType.REFRESH_TOKEN))
//                .token(refreshToken)
//                .type(TokenType.REFRESH_TOKEN)
//                .createdAt(LocalDateTime.now())
//                .expiredAt(jwtService.extractExpiration(refreshToken, TokenType.REFRESH_TOKEN))
//                .reason("SIGN-OUT")
//                .build();
//
//        BlackListToken blackListAT = BlackListToken.builder()
//                .id(jwtService.extractTokenId(accessToken, TokenType.ACCESS_TOKEN))
//                .token(accessToken)
//                .type(TokenType.ACCESS_TOKEN)
//                .createdAt(LocalDateTime.now())
//                .expiredAt(jwtService.extractExpiration(accessToken, TokenType.ACCESS_TOKEN))
//                .reason("SIGN-OUT")
//                .build();
//
//        blackListTokenRepository.saveAll(List.of(blackListAT, blackListRT));
//
//        //clear the authentication from SecurityContextHolder to log out the user
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication != null) {
//            SecurityContextHolder.clearContext();
//            log.info("User {} has been logged out successfully", user.getId());
//        }
//    }

//    public TokenResponse refreshToken(String refreshToken) {
//        log.info("Get refresh token");
//
//        if(!StringUtils.hasLength(refreshToken)){
//            throw new InvalidDataException("Token must be not blank");
//        }
//
//        try {
//            //verify token
//            String username = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);
//
//            //Check user is active or inactived
//            User user = userRepository.findByUsername(username)
//                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//            //generate new access token
//            String accessToken = jwtService.generateAccessToken(user.getId(), username, user.getAuthorities());
//
//            return TokenResponse.builder()
//                    .accessToken(accessToken)
//                    .refreshToken(refreshToken)
//                    .build();
//        } catch (Exception e) {
//            log.error("Access denied! Error message: {}", e.getMessage());
//            throw new ForbiddenException(e.getMessage());
//        }
//    }

//    public void confirmEmail(String email, String secretCode) {
//        log.info("Verifying email :{}", email);
//
//        // Find emailCode in redis
//        EmailCode emailCode = emailCodeRepository.findById(secretCode)
//                .orElseThrow(
//                        () -> {
//                            log.info("Verification failed");
//                            return new ResourceNotFoundException("Secret Code not found");
//                        }
//                );
//
//
//        // compare emails, if verification is successful and delete emailCode
//        if(email.equals(emailCode.getEmail())){
//            User user = userRepository.findByEmail(email)
//                    .orElseThrow(
//                            () -> new ResourceNotFoundException("User not found")
//                    );
//
//            user.setStatus(UserStatus.ACTIVE);
//            userRepository.save(user);
//            log.info("Email verified successfully");
//            emailCodeRepository.delete(emailCode);
//        } else {
//            log.error("Verification failed, Emails do not match");
//            throw new BadRequestException("Email verification failed");
//        }
//    }
}
