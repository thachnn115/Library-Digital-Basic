package be.library_digital.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MAIL-SERVICE")
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@example.com}")
    private String from;

    @Async
    public void sendOtp(String to, String name, String otp, long expiryMinutes) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject("Your OTP Code");
            helper.setText(buildOtpHtml(name, otp, expiryMinutes), true);

            mailSender.send(mimeMessage);
            log.info("Sent OTP email to {}", to);
        } catch (MessagingException | IOException e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Cannot send OTP email", e);
        }
    }

    @Async
    public void sendPasswordResetLink(String to, String name, String resetLink, long expiryMinutes) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject("Reset your Library Digital password");
            helper.setText(buildResetPasswordHtml(name, resetLink, expiryMinutes), true);

            mailSender.send(mimeMessage);
            log.info("Sent password reset email to {}", to);
        } catch (MessagingException | IOException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Cannot send password reset email", e);
        }
    }

    private String buildOtpHtml(String name, String otp, long expiryMinutes) throws IOException {
        String template = new String(new ClassPathResource("templates/otp-email.html").getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String safeName = name != null && !name.isBlank() ? name : "there";

        return template
                .replace("{{name}}", safeName)
                .replace("{{otp}}", otp)
                .replace("{{expiryMinutes}}", String.valueOf(expiryMinutes));
    }

    private String buildResetPasswordHtml(String name, String resetLink, long expiryMinutes) throws IOException {
        String template = new String(new ClassPathResource("templates/password-reset-email.html").getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String safeName = name != null && !name.isBlank() ? name : "there";

        return template
                .replace("{{name}}", safeName)
                .replace("{{resetLink}}", resetLink)
                .replace("{{expiryMinutes}}", String.valueOf(expiryMinutes));
    }
}
