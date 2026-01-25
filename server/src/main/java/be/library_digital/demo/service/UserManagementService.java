package be.library_digital.demo.service;

import be.library_digital.demo.common.Gender;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.common.UserStatus;
import be.library_digital.demo.dto.request.ChangePasswordRequest;
import be.library_digital.demo.dto.request.CreateUserRequest;
import be.library_digital.demo.dto.request.ResetPasswordRequest;
import be.library_digital.demo.dto.request.UpdateUserRequest;
import be.library_digital.demo.dto.response.PublicUser;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Classroom;
import be.library_digital.demo.model.Department;
import be.library_digital.demo.model.Role;
import be.library_digital.demo.model.User;
import be.library_digital.demo.model.UserHasRole;
import be.library_digital.demo.repository.ClassroomRepository;
import be.library_digital.demo.repository.DepartmentRepository;
import be.library_digital.demo.repository.RoleRepository;
import be.library_digital.demo.repository.UserHasRoleRepository;
import be.library_digital.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-MANAGEMENT-SERVICE")
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final ClassroomRepository classroomRepository;
    private final RoleRepository roleRepository;
    private final UserHasRoleRepository userHasRoleRepository;

    @Value("${file.avatar-upload-dir:uploads/avatars}")
    private String avatarUploadDir;

    public PublicUser createUser(CreateUserRequest request, User currentUser) {
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role subAdminRole = roleRepository.findByName("SUB_ADMIN").orElseThrow();
        Role lecturerRole = roleRepository.findByName("LECTURER").orElseThrow();

        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to create users");
        }

        boolean isAdmin = UserType.ADMIN.equals(currentUser.getType());
        boolean isSubAdmin = UserType.SUB_ADMIN.equals(currentUser.getType());
        if (!isAdmin && !isSubAdmin) {
            throw new ForbiddenException("You don't have permission to create users");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email already exists");
        }

        UserType type = request.getType() != null ? request.getType() : UserType.LECTURER;
        if (UserType.ADMIN.equals(type)) {
            throw new ForbiddenException("Cannot create additional ADMIN accounts");
        }
        Department dept = null;
        Classroom classroom = null;

        if (isSubAdmin) {
            // SUB_ADMIN: only create LECTURER in their own department
            if (UserType.STUDENT.equals(type)) {
                throw new ForbiddenException("SUB_ADMIN cannot create STUDENT users");
            }
            if (!UserType.LECTURER.equals(type)) {
                type = UserType.LECTURER; // force to lecturer
            }
            if (currentUser.getDepartment() == null) {
                throw new ForbiddenException("SUB_ADMIN must belong to a department");
            }
            dept = currentUser.getDepartment();
        } else if (isAdmin) {
            // ADMIN creating SUB_ADMIN/LECTURER must have department provided
            if (UserType.SUB_ADMIN.equals(type) || UserType.LECTURER.equals(type)) {
                if (request.getDepartmentId() == null) {
                    throw new BadRequestException("Department is required for SUB_ADMIN or LECTURER");
                }
                dept = departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            } else {
                if (request.getDepartmentId() != null) {
                    dept = departmentRepository.findById(request.getDepartmentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
                }
            }
        }

        if (UserType.STUDENT.equals(type)) {
            String classroomId = request.getClassroomId();
            if (classroomId == null || classroomId.trim().isEmpty()) {
                throw new BadRequestException("Classroom is required for STUDENT");
            }
            classroom = classroomRepository.findById(classroomId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        String userIdentifier = request.getUserIdentifier();
        if (userIdentifier != null) {
            userIdentifier = userIdentifier.trim();
        }
        if (userIdentifier == null || userIdentifier.isEmpty()) {
            if (UserType.STUDENT.equals(type)) {
                Integer startYear = classroom != null && classroom.getCohort() != null
                        ? classroom.getCohort().getStartYear()
                        : null;
                if (startYear == null) {
                    throw new BadRequestException("Classroom cohort start year is required for STUDENT identifier");
                }
                userIdentifier = generateStudentIdentifier(startYear, null);
            } else {
                userIdentifier = generateUserIdentifier(type, dept, new HashMap<>());
            }
        }
        user.setUserIdentifier(userIdentifier);
        user.setDateOfBirth(request.getDateOfBirth());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setType(type);
        user.setStatus(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE);
        user.setDepartment(dept);
        user.setClassroom(classroom);
        user.setMustChangePassword(true);
        user.setFailedLoginAttempts(0);
        user.setLastFailedLoginDate(null);

        User saved = userRepository.save(user);
        UserType finalType = type;
        Role role = roleRepository.findByName(type.name())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + finalType.name()));
        UserHasRole userHasRole = UserHasRole.builder()
                .role(role)
                .user(saved)
                .build();
        userHasRoleRepository.save(userHasRole);
        saved.getRoles().add(userHasRole);
        userRepository.save(saved);
        log.info("User {} created by {}", saved.getId(), currentUser.getId());
        return PublicUser.fromUser(saved);
    }

    public PublicUser getProfile(User currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("You must be logged in to view profile");
        }
        User fresh = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return PublicUser.fromUser(fresh);
    }

    public List<PublicUser> listUsers(User currentUser, int page, int size) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to view users");
        }

        PageRequest pageable = PageRequest.of(page, size);
        List<User> users;

        if (UserType.ADMIN.equals(currentUser.getType())) {
            users = userRepository.findAll(pageable).getContent();
        } else if (UserType.SUB_ADMIN.equals(currentUser.getType()) || UserType.LECTURER.equals(currentUser.getType())) {
            if (currentUser.getDepartment() == null) {
                throw new ForbiddenException("You don't have permission to view users without a department");
            }
            users = userRepository.findByDepartment_Id(currentUser.getDepartment().getId(), pageable).getContent();
        } else {
            throw new ForbiddenException("You don't have permission to view users");
        }

        return users.stream().map(PublicUser::fromUser).collect(Collectors.toList());
    }

    public PublicUser updateUser(String userId, UpdateUserRequest request, User currentUser) {
        if (request == null) {
            throw new BadRequestException("Request body must not be null");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = currentUser != null && UserType.ADMIN.equals(currentUser.getType());
        boolean isSubAdmin = currentUser != null && UserType.SUB_ADMIN.equals(currentUser.getType());
        boolean isSelf = currentUser != null && target.getId().equals(currentUser.getId());

        if (isAdmin) {
            applyAdminUpdates(target, request);
        } else if (isSubAdmin) {
            ensureSameDepartment(target, currentUser);
            ensureNoAdminEscalation(target, request);
            applySubAdminUpdates(target, request, currentUser);
        } else if (isSelf) {
            ensureNoAdminOnlyFields(request);
            applySelfUpdates(target, request);
        } else {
            throw new ForbiddenException("You don't have permission to update this user");
        }

        User saved = userRepository.save(target);
        log.info("User {} updated by {}", saved.getId(), currentUser != null ? currentUser.getId() : "SYSTEM");
        return PublicUser.fromUser(saved);
    }

    public PublicUser updateAvatar(String userId, MultipartFile avatar, User currentUser) throws IOException {
        if (avatar == null || avatar.isEmpty()) {
            throw new BadRequestException("Avatar file must not be empty");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = currentUser != null && UserType.ADMIN.equals(currentUser.getType());
        boolean isSubAdmin = currentUser != null && UserType.SUB_ADMIN.equals(currentUser.getType());
        boolean isSelf = currentUser != null && target.getId().equals(currentUser.getId());
        if (!isAdmin && !isSelf) {
            if (isSubAdmin) {
                ensureSameDepartment(target, currentUser);
            } else {
                throw new ForbiddenException("You don't have permission to update this avatar");
            }
        }

        String original = avatar.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }

        Path dirPath = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        String filename = target.getId() + "-" + UUID.randomUUID() + ext;
        Path targetPath = dirPath.resolve(filename);
        try (InputStream in = avatar.getInputStream()) {
            Files.copy(in, targetPath);
        }

        target.setAvatarUrl(targetPath.toString());
        User saved = userRepository.save(target);
        log.info("Updated avatar for user {} by {}", saved.getId(), currentUser != null ? currentUser.getId() : "SYSTEM");
        return PublicUser.fromUser(saved);
    }

    public void changeOwnPassword(User currentUser, ChangePasswordRequest request) {
        if (currentUser == null) {
            throw new ForbiddenException("You don't have permission to change password");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        if(currentUser.getMustChangePassword().equals(Boolean.TRUE)) {
            currentUser.setMustChangePassword(false);
        }
        userRepository.save(currentUser);
        log.info("User {} changed password", currentUser.getId());
    }

    public void resetPassword(String userId, ResetPasswordRequest request, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to reset passwords");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = UserType.ADMIN.equals(currentUser.getType());
        boolean isSubAdmin = UserType.SUB_ADMIN.equals(currentUser.getType());
        if (isSubAdmin) {
            ensureSameDepartment(target, currentUser);
            if (!UserType.LECTURER.equals(target.getType())) {
                throw new ForbiddenException("SUB_ADMIN can only reset LECTURER password in their department");
            }
        } else if (!isAdmin) {
            throw new ForbiddenException("You don't have permission to reset this password");
        }

        target.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(target);
        log.info("Admin {} reset password for user {}", currentUser.getId(), userId);
    }

    public void deleteUser(String userId, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to delete users");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = UserType.ADMIN.equals(currentUser.getType());
        boolean isSubAdmin = UserType.SUB_ADMIN.equals(currentUser.getType());

        if (isAdmin) {
            // ok
        } else if (isSubAdmin) {
            ensureSameDepartment(target, currentUser);
            if (UserType.ADMIN.equals(target.getType())) {
                throw new ForbiddenException("SUB_ADMIN cannot delete ADMIN user");
            }
        } else {
            throw new ForbiddenException("You don't have permission to delete users");
        }

        userRepository.delete(target);
        log.info("User {} deleted by {}", target.getId(), currentUser.getId());
    }

    public int importUsers(MultipartFile file, User currentUser) {
        if (currentUser == null || !UserType.ADMIN.equals(currentUser.getType())) {
            throw new ForbiddenException("Only ADMIN can import users");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: ADMIN"));
        Role subAdminRole = roleRepository.findByName("SUB_ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: SUB_ADMIN"));
        Role lecturerRole = roleRepository.findByName("LECTURER")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: LECTURER"));

        Map<UserType, Role> roleByType = new HashMap<>();
        roleByType.put(UserType.ADMIN, adminRole);
        roleByType.put(UserType.SUB_ADMIN, subAdminRole);
        roleByType.put(UserType.LECTURER, lecturerRole);

        Map<String, Integer> prefixCounters = new HashMap<>();
        List<User> toSave = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean isHeader = true;
            for (Row row : sheet) {
                if (isHeader) { // skip header row
                    isHeader = false;
                    continue;
                }
                if (row == null || isRowEmpty(row)) {
                    continue;
                }
                String email = getStringCell(row, 0);
                String rawPassword = getStringCell(row, 1);
                String genderStr = getStringCell(row, 2);
                String fullName = getStringCell(row, 3);
                String userTypeStr = getStringCell(row, 4);
                String departmentCode = getStringCell(row, 5);

                if (email == null || email.isEmpty() || rawPassword == null || rawPassword.isEmpty() ||
                        userTypeStr == null || userTypeStr.isEmpty()) {
                    log.warn("Skipping row {} due to missing required fields", row.getRowNum());
                    continue;
                }

                String emailLower = email.toLowerCase();
                if (userRepository.existsByEmail(emailLower)) {
                    log.warn("Skipping existing user with email {}", email);
                    continue;
                }

                UserType userType = parseUserType(userTypeStr);
                Department department = null;
                if (departmentCode != null && !departmentCode.isEmpty()) {
                    department = departmentRepository.findByCodeIgnoreCase(departmentCode)
                            .orElse(null);
                    if (department == null) {
                        log.warn("Skipping row {} due to missing department with code {}", row.getRowNum(), departmentCode);
                        continue;
                    }
                }

                if ((UserType.SUB_ADMIN.equals(userType) || UserType.LECTURER.equals(userType)) && department == null) {
                    log.warn("Skipping row {} due to missing department for {}", row.getRowNum(), userType);
                    continue;
                }

                if (!roleByType.containsKey(userType)) {
                    log.warn("Skipping row {} due to unsupported user type {}", row.getRowNum(), userType);
                    continue;
                }

                User user = new User();
                user.setEmail(emailLower);
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setUserIdentifier(generateUserIdentifier(userType, department, prefixCounters));
                user.setFullName(fullName);
                user.setGender(parseGender(genderStr));
                user.setType(userType);
                user.setStatus(UserStatus.ACTIVE);
                user.setDateOfBirth(LocalDate.now());
                user.setMustChangePassword(true);
                user.setFailedLoginAttempts(0);
                user.setLastFailedLoginDate(null);

                if (department != null) {
                    user.setDepartment(department);
                }

                toSave.add(user);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read Excel file");
        }

        if (toSave.isEmpty()) {
            return 0;
        }

        userRepository.saveAll(toSave);

        List<UserHasRole> rolesToSave = new ArrayList<>();
        for (User user : toSave) {
            Role role = roleByType.get(user.getType());
            if (role == null) {
                log.warn("Skipping role assignment for user {}", user.getEmail());
                continue;
            }
            rolesToSave.add(UserHasRole.builder()
                    .role(role)
                    .user(user)
                    .build());
        }
        userHasRoleRepository.saveAll(rolesToSave);

        log.info("Imported {} users via Excel", toSave.size());
        return toSave.size();
    }

    public int importStudents(MultipartFile file, User currentUser) {
        if (currentUser == null || !UserType.ADMIN.equals(currentUser.getType())) {
            throw new ForbiddenException("Only ADMIN can import students");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: STUDENT"));
        Map<String, Integer> prefixCounters = new HashMap<>();
        List<User> toSave = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean isHeader = true;
            for (Row row : sheet) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                String email = getStringCell(row, 0);
                String rawPassword = getStringCell(row, 1);
                String fullName = getStringCell(row, 2);
                String birthYearStr = getStringCell(row, 3);
                String address = getStringCell(row, 4);
                String phone = getStringCell(row, 5);
                String classroomCode = getStringCell(row, 6);
                String statusStr = getStringCell(row, 7);

                if (email == null || email.isEmpty() || rawPassword == null || rawPassword.isEmpty()
                        || fullName == null || fullName.isEmpty()
                        || birthYearStr == null || birthYearStr.isEmpty()
                        || classroomCode == null || classroomCode.isEmpty()) {
                    log.warn("Skipping row {} due to missing required fields", row.getRowNum());
                    continue;
                }

                String emailLower = email.toLowerCase();
                if (userRepository.existsByEmail(emailLower)) {
                    log.warn("Skipping existing user with email {}", emailLower);
                    continue;
                }

                Integer birthYear = parseYear(birthYearStr);
                if (birthYear == null) {
                    log.warn("Skipping row {} due to invalid birthYear {}", row.getRowNum(), birthYearStr);
                    continue;
                }

                Classroom classroom = classroomRepository.findByCodeIgnoreCase(classroomCode.trim())
                        .orElse(null);
                if (classroom == null) {
                    log.warn("Skipping row {} due to missing classroom with code {}", row.getRowNum(), classroomCode);
                    continue;
                }

                Integer startYear = classroom.getCohort() != null ? classroom.getCohort().getStartYear() : null;
                if (startYear == null) {
                    log.warn("Skipping row {} due to missing cohort start year for classroom {}", row.getRowNum(), classroomCode);
                    continue;
                }

                User user = new User();
                user.setEmail(emailLower);
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setFullName(fullName);
                user.setDateOfBirth(LocalDate.of(birthYear, 1, 1));
                user.setAddress(address);
                user.setPhone(phone);
                user.setType(UserType.STUDENT);
                UserStatus status = parseUserStatus(statusStr);
                user.setStatus(status != null ? status : UserStatus.ACTIVE);
                user.setUserIdentifier(generateStudentIdentifier(startYear, prefixCounters));
                user.setClassroom(classroom);
                user.setMustChangePassword(true);
                user.setFailedLoginAttempts(0);
                user.setLastFailedLoginDate(null);
                toSave.add(user);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read Excel file");
        }

        if (toSave.isEmpty()) {
            return 0;
        }

        userRepository.saveAll(toSave);

        List<UserHasRole> rolesToSave = new ArrayList<>();
        for (User user : toSave) {
            rolesToSave.add(UserHasRole.builder()
                    .role(studentRole)
                    .user(user)
                    .build());
        }
        userHasRoleRepository.saveAll(rolesToSave);

        log.info("Imported {} students via Excel", toSave.size());
        return toSave.size();
    }

    public byte[] generateUserImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");
            Row header = sheet.createRow(0);
            String[] headers = {
                    "email",
                    "password",
                    "gender",
                    "fullName",
                    "userType",
                    "departmentCode"
            };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
                sheet.setColumnWidth(i, 20 * 256);
            }
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate import template");
        }
    }

    public byte[] generateStudentImportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students");
            Row header = sheet.createRow(0);
            String[] headers = {
                    "email",
                    "password",
                    "fullName",
                    "birthYear",
                    "address",
                    "phone",
                    "classroomCode",
                    "status"
            };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
                sheet.setColumnWidth(i, 20 * 256);
            }
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate student import template");
        }
    }

    private String generateUserIdentifier(UserType userType, Department department, Map<String, Integer> prefixCounters) {
        String prefix = buildUserIdentifierPrefix(userType, department);
        int nextSequence = prefixCounters.computeIfAbsent(prefix, this::loadNextSequenceForPrefix);

        String identifier;
        int current = nextSequence;
        do {
            identifier = prefix + String.format("%03d", current);
            current++;
        } while (userRepository.existsByUserIdentifier(identifier));

        prefixCounters.put(prefix, current);
        return identifier;
    }

    private String generateStudentIdentifier(Integer startYear, Map<String, Integer> prefixCounters) {
        if (startYear == null) {
            throw new BadRequestException("Start year is required for student identifier");
        }
        String prefix = String.valueOf(startYear);
        int nextSequence = prefixCounters != null
                ? prefixCounters.computeIfAbsent(prefix, this::loadNextSequenceForPrefix)
                : loadNextSequenceForPrefix(prefix);

        String identifier;
        int current = nextSequence;
        do {
            identifier = prefix + String.format("%04d", current);
            current++;
        } while (userRepository.existsByUserIdentifier(identifier));

        if (prefixCounters != null) {
            prefixCounters.put(prefix, current);
        }
        return identifier;
    }

    private String buildUserIdentifierPrefix(UserType userType, Department department) {
        if (userType == null) {
            throw new BadRequestException("UserType is required for user identifier");
        }
        switch (userType) {
            case LECTURER:
                if (department == null || department.getCode() == null || department.getCode().trim().isEmpty()) {
                    throw new BadRequestException("Department code is required for LECTURER");
                }
                return department.getCode().trim().toUpperCase() + "GV";
            case ADMIN:
                return "ADMIN";
            case SUB_ADMIN:
                return "SUB_ADMIN";
            default:
                throw new BadRequestException("Unsupported userType for identifier: " + userType);
        }
    }

    private int loadNextSequenceForPrefix(String prefix) {
        Optional<User> lastUser = userRepository.findTopByUserIdentifierStartingWithOrderByUserIdentifierDesc(prefix);
        if (lastUser.isPresent()) {
            String identifier = lastUser.get().getUserIdentifier();
            if (identifier != null && identifier.length() > prefix.length()) {
                String suffix = identifier.substring(prefix.length());
                int current = parseSequenceSuffix(suffix);
                return current + 1;
            }
        }
        return 1;
    }

    private int parseSequenceSuffix(String value) {
        if (value == null || value.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Integer parseYear(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            int year = Integer.parseInt(value.trim());
            if (year < 1900 || year > LocalDate.now().getYear() + 1) {
                return null;
            }
            return year;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private UserStatus parseUserStatus(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        try {
            return switch (normalized) {
                case "ACTIVE" -> UserStatus.ACTIVE;
                case "INACTIVE" -> UserStatus.INACTIVE;
                case "LOCK", "LOCKED" -> UserStatus.LOCK;
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    private void applyAdminUpdates(User target, UpdateUserRequest request) {
        if (request.getEmail() != null) {
            String emailLower = request.getEmail().trim().toLowerCase();
            if (!emailLower.equalsIgnoreCase(target.getEmail()) && userRepository.existsByEmail(emailLower)) {
                throw new BadRequestException("Email already exists");
            }
            target.setEmail(emailLower);
        }
        if (request.getFullName() != null) {
            target.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            target.setGender(request.getGender());
        }
        if (request.getUserIdentifier() != null) {
            target.setUserIdentifier(request.getUserIdentifier());
        }
        if (request.getDateOfBirth() != null) {
            target.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getPhone() != null) {
            target.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            target.setAddress(request.getAddress());
        }
        if (request.getType() != null) {
            target.setType(request.getType());
        }
        if (request.getStatus() != null) {
            target.setStatus(request.getStatus());
            if (!UserStatus.LOCK.equals(request.getStatus())) {
                target.setFailedLoginAttempts(0);
                target.setLastFailedLoginDate(null);
            }
        }
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            target.setDepartment(dept);
        }
        if (request.getClassroomId() != null) {
            Classroom classroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
            target.setClassroom(classroom);
        }
    }

    private void applySelfUpdates(User target, UpdateUserRequest request) {
        if (request.getDateOfBirth() == null && request.getPhone() == null) {
            throw new BadRequestException("No updatable fields provided");
        }

        if (request.getDateOfBirth() != null) {
            target.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getPhone() != null) {
            target.setPhone(request.getPhone());
        }
    }

    private void ensureNoAdminOnlyFields(UpdateUserRequest request) {
        if (request.getFullName() != null || request.getGender() != null ||
                request.getUserIdentifier() != null || request.getEmail() != null ||
                request.getType() != null || request.getStatus() != null ||
                request.getDepartmentId() != null || request.getAddress() != null ||
                request.getClassroomId() != null) {
            throw new ForbiddenException("You can only update phone or dateOfBirth");
        }
    }

    private void applySubAdminUpdates(User target, UpdateUserRequest request, User currentUser) {
        if (request.getEmail() != null) {
            String emailLower = request.getEmail().trim().toLowerCase();
            if (!emailLower.equalsIgnoreCase(target.getEmail()) && userRepository.existsByEmail(emailLower)) {
                throw new BadRequestException("Email already exists");
            }
            target.setEmail(emailLower);
        }
        if (request.getFullName() != null) {
            target.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            target.setGender(request.getGender());
        }
        if (request.getUserIdentifier() != null) {
            target.setUserIdentifier(request.getUserIdentifier());
        }
        if (request.getDateOfBirth() != null) {
            target.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getPhone() != null) {
            target.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            target.setAddress(request.getAddress());
        }
        if (request.getType() != null) {
            if (UserType.ADMIN.equals(request.getType())) {
                throw new ForbiddenException("SUB_ADMIN cannot assign ADMIN role");
            }
            target.setType(request.getType());
        }
        if (request.getStatus() != null) {
            target.setStatus(request.getStatus());
            if (!UserStatus.LOCK.equals(request.getStatus())) {
                target.setFailedLoginAttempts(0);
                target.setLastFailedLoginDate(null);
            }
        }
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            if (!currentUser.getDepartment().getId().equals(dept.getId())) {
                throw new ForbiddenException("SUB_ADMIN can only assign their own department");
            }
            target.setDepartment(dept);
        }
        if (request.getClassroomId() != null) {
            Classroom classroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
            target.setClassroom(classroom);
        }
    }

    private void ensureNoAdminEscalation(User target, UpdateUserRequest request) {
        if (UserType.ADMIN.equals(target.getType())) {
            throw new ForbiddenException("Cannot modify ADMIN user");
        }
    }

    private void ensureSameDepartment(User target, User currentUser) {
        if (currentUser.getDepartment() == null || target.getDepartment() == null ||
                !currentUser.getDepartment().getId().equals(target.getDepartment().getId())) {
            throw new ForbiddenException("Action allowed only within your department");
        }
    }

    private Gender parseGender(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        switch (normalized) {
            case "MALE":
            case "NAM":
                return Gender.MALE;
            case "FEMALE":
            case "NU":
                return Gender.FEMALE;
            case "OTHER":
            case "KHAC":
                return Gender.OTHER;
            default:
                return null;
        }
    }

    private UserType parseUserType(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        try {
            return switch (normalized) {
                case "ADMIN" -> UserType.ADMIN;
                case "SUB_ADMIN", "SUB-ADMIN" -> UserType.SUB_ADMIN;
                case "LECTURER" -> UserType.LECTURER;
                case "STUDENT" -> UserType.STUDENT;
                default -> throw new BadRequestException("Invalid userType: " + value);
            };
        } catch (Exception e) {
            throw new BadRequestException("Invalid userType: " + value);
        }
    }

    private String getStringCell(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        return new org.apache.poi.ss.usermodel.DataFormatter().formatCellValue(cell).trim();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        int lastCell = row.getLastCellNum();
        for (int i = 0; i < lastCell; i++) {
            String value = getStringCell(row, i);
            if (value != null && !value.isEmpty()) {
                return false;
            }
        }
        return true;
    }
}
