package be.library_digital.demo.config;

import be.library_digital.demo.common.TokenType;
import be.library_digital.demo.service.JwtService;
import be.library_digital.demo.service.UserServiceImpl;
import be.library_digital.demo.model.User;
import be.library_digital.demo.common.UserType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "CUSTOMIZE-REQUEST-FILTER")
public class CustomizeRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserServiceImpl userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            authHeader = authHeader.substring("Bearer ".length());
            log.info("Bearer authHeader: {}", authHeader);

            String username = "";

            try {
                username = jwtService.extractUsername(authHeader, TokenType.ACCESS_TOKEN);
                log.info("username: {}", username);
            } catch (AccessDeniedException e){
                log.error(e.getMessage());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(buildErrorResponse(e.getMessage()));
                return;
            }

            UserDetails userDetails = userService.loadUserByUsername(username);

            // Enforce must-change-password for non-admin accounts
            if (userDetails instanceof User user) {
                if (!UserType.ADMIN.equals(user.getType()) && Boolean.TRUE.equals(user.getMustChangePassword())) {
                    if (!isAllowedWhileMustChange(request)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");
                        response.getWriter().write(buildErrorResponse("Bạn cần đổi mật khẩu trước khi sử dụng hệ thống"));
                        return;
                    }
                }
            }

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            filterChain.doFilter(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedWhileMustChange(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        // allow change-password endpoint and auth/forgot/reset flows
        if (path.equalsIgnoreCase("/users/change-password") && "POST".equalsIgnoreCase(method)) return true;
        if (path.startsWith("/auth/")) return true;
        return false;
    }

    private String buildErrorResponse(String message){
        try {
            ErrorResponse errorResponse = new ErrorResponse();
            errorResponse.setTimestamp(new Date());
            errorResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            errorResponse.setError("Forbidden");
            errorResponse.setMessage(message);

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(errorResponse);

        } catch (Exception e){
            return "";
        }
    }

    @Getter
    @Setter
    private class ErrorResponse {

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
        private Date timestamp;
        private int status;
        private String error;
        private String message;
    }
}
