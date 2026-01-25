package be.library_digital.demo.init;

import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.Role;
import be.library_digital.demo.model.User;
import be.library_digital.demo.model.UserHasRole;
import be.library_digital.demo.repository.RoleRepository;
import be.library_digital.demo.repository.UserHasRoleRepository;
import be.library_digital.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "INIT-SERVICE")
public class InitService {

    @Value("${account.admin.email}")
    private String ADMIN_EMAIL;

    @Value("${account.admin.password}")
    private String ADMIN_PASSWORD;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserHasRoleRepository userHasRoleRepository;

    @Transactional
    public void initializeRole(){
        List<Role> defaultRoles = Arrays.asList(
                Role.builder().name("ADMIN").description("Administrator").build(),
                Role.builder().name("SUB_ADMIN").description("Quản trị viên phụ trách khoa/bộ phận").build(),
                Role.builder().name("LECTURER").description("Giảng viên").build(),
                Role.builder().name("STUDENT").description("Học viên").build()
        );

        for (Role role : defaultRoles){
            if(!roleRepository.existsByName(role.getName())){
                roleRepository.save(role);
                log.info("Create {} successfully", role.getDescription());
            }
        }
    }

    @Transactional
    public void initializeUser(){
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role subAdminRole = roleRepository.findByName("SUB_ADMIN").orElseThrow();
        Role lecturerRole = roleRepository.findByName("LECTURER").orElseThrow();

        User adminAccount = User.builder()
                .fullName("administrator root")
                .email(ADMIN_EMAIL)
                .dateOfBirth(LocalDate.now())
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .status(UserStatus.ACTIVE)
                .type(UserType.ADMIN)
                .build();

        User subAdminAccount = User.builder()
                .fullName("SUB_ADMIN User")
                .email("subadmin@gmail.com")
                .dateOfBirth(LocalDate.now())
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .status(UserStatus.ACTIVE)
                .type(UserType.SUB_ADMIN)
                .mustChangePassword(true)
                .failedLoginAttempts(0)
                .build();

        User lecturerAccount = User.builder()
                .fullName("LECTURER User")
                .email("lecturer@gmail.com")
                .dateOfBirth(LocalDate.now())
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .status(UserStatus.ACTIVE)
                .type(UserType.LECTURER)
                .mustChangePassword(true)
                .failedLoginAttempts(0)
                .build();

        if(!userRepository.existsByEmail(adminAccount.getUsername())){
            userRepository.save(adminAccount);

            UserHasRole userHasRole = UserHasRole.builder()
                    .role(adminRole)
                    .user(adminAccount)
                    .build();
            userHasRoleRepository.save(userHasRole);

            log.info("Create admin account successfully");
        }

        if(!userRepository.existsByEmail(subAdminAccount.getUsername())){
            userRepository.save(subAdminAccount);

            UserHasRole userHasRole = UserHasRole.builder()
                    .role(subAdminRole)
                    .user(subAdminAccount)
                    .build();
            userHasRoleRepository.save(userHasRole);

            log.info("Create sub-admin account successfully");
        }

        if(!userRepository.existsByEmail(lecturerAccount.getUsername())){
            userRepository.save(lecturerAccount);

            UserHasRole userHasRole = UserHasRole.builder()
                    .role(lecturerRole)
                    .user(lecturerAccount)
                    .build();
            userHasRoleRepository.save(userHasRole);

            log.info("Create lecturer account successfully");
        }
    }
}
