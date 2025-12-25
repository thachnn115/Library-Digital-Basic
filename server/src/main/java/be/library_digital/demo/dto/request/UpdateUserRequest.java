package be.library_digital.demo.dto.request;

import be.library_digital.demo.common.Gender;
import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.common.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Size(max = 255)
    private String fullName;

    private Gender gender;

    @Size(max = 100)
    private String userIdentifier;

    @PastOrPresent
    private LocalDate dateOfBirth;

    @Size(max = 30)
    private String phone;

    @Email
    @Size(max = 255)
    private String email;

    private UserType type;

    private UserStatus status;

    private Long departmentId;
}
