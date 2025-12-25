package be.library_digital.demo.dto.request;

import be.library_digital.demo.common.Gender;
import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.common.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    private String password;

    @Size(max = 255)
    private String fullName;

    private Gender gender;

    @Size(max = 100)
    private String userIdentifier;

    @PastOrPresent
    private LocalDate dateOfBirth;

    @Size(max = 30)
    private String phone;

    private UserType type;

    private UserStatus status;

    private Long departmentId;
}
