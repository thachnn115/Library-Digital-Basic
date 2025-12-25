package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetForgotPasswordRequest implements Serializable {

    @NotBlank(message = "Token must not be blank")
    private String token;

    @NotBlank(message = "New password must not be blank")
    private String newPassword;
}
