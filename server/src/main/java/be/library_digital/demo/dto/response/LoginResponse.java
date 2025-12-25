package be.library_digital.demo.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String accessToken;
//    private String refreshToken;
    private Long expiresIn;
    private PublicUser user;
    private Boolean mustChangePassword;
}
