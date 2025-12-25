package be.library_digital.demo.dto.response;

import be.library_digital.demo.common.Gender;
import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.User;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUser implements Serializable {
    private String id;
    private String email;
    private String fullName;
    private String role;
    private String userIdentifier;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phone;
    private UserType type;
    private UserStatus status;
    private String avatarUrl;
    private DepartmentResponse department;

    public static PublicUser fromUser(User user) {
        if (user == null) return null;

        DepartmentResponse deptResp = DepartmentResponse.fromDepartment(user.getDepartment());

        return PublicUser.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getType() != null ? user.getType().toString() : null)
                .userIdentifier(user.getUserIdentifier())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .phone(user.getPhone())
                .type(user.getType())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .department(deptResp)
                .build();
    }
}
