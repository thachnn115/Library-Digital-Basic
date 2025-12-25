package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "currentPassword không được để trống")
    private String currentPassword;

    @NotBlank(message = "newPassword không được để trống")
    private String newPassword;
}
