package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.ChangePasswordRequest;
import be.library_digital.demo.dto.request.CreateUserRequest;
import be.library_digital.demo.dto.request.ResetPasswordRequest;
import be.library_digital.demo.dto.request.UpdateUserRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.PublicUser;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Validated
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Controller")
@Slf4j(topic = "USER-CONTROLLER")
public class UserController {

    private final UserManagementService userManagementService;

    @Operation(summary = "Get current user profile")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        PublicUser resp = userManagementService.getProfile(currentUser);

        ApiResponse<PublicUser> api = ApiResponse.<PublicUser>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Update current user profile", description = "Users can update their own phone/dateOfBirth; ADMIN still can update anyone via /users/{id}")
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody @Valid UpdateUserRequest request,
                                           Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        PublicUser resp = userManagementService.updateUser(currentUser.getId(), request, currentUser);

        ApiResponse<PublicUser> api = ApiResponse.<PublicUser>builder()
                .status(HttpStatus.OK.value())
                .message("Profile updated successfully")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List users", description = "ADMIN: all users; SUB_ADMIN/LECTURER: users in same department")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        List<PublicUser> users = userManagementService.listUsers(currentUser, page, size);

        ApiResponse<List<PublicUser>> api = ApiResponse.<List<PublicUser>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(users)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Create user", description = "ADMIN: any; SUB_ADMIN: only within their department and cannot create ADMIN")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody @Valid CreateUserRequest request,
                                        Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        PublicUser resp = userManagementService.createUser(request, currentUser);

        ApiResponse<PublicUser> api = ApiResponse.<PublicUser>builder()
                .status(HttpStatus.CREATED.value())
                .message("User created successfully")
                .data(resp)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @Operation(summary = "Change own password")
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordRequest request,
                                            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        userManagementService.changeOwnPassword(currentUser, request);

        ApiResponse<Void> api = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Password changed successfully")
                .data(null)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Admin import users from Excel", description = "ADMIN only. Columns: email, password, userIdentifier, gender, fullName, userType, departmentName")
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> importUsers(@RequestPart("file") MultipartFile file, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        int created = userManagementService.importUsers(file, currentUser);

        ApiResponse<Integer> api = ApiResponse.<Integer>builder()
                .status(HttpStatus.CREATED.value())
                .message("Imported users successfully")
                .data(created)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @Operation(summary = "Update user avatar", description = "ADMIN can update any user; SUB_ADMIN same department; users can update their own avatar")
    @PutMapping("/{id}/avatar")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN') or #id == principal.id")
    public ResponseEntity<?> updateAvatar(@PathVariable String id,
                                          @RequestPart("file") MultipartFile avatar,
                                          Authentication authentication) throws IOException {
        User currentUser = (User) authentication.getPrincipal();
        PublicUser resp = userManagementService.updateAvatar(id, avatar, currentUser);

        ApiResponse<PublicUser> api = ApiResponse.<PublicUser>builder()
                .status(HttpStatus.OK.value())
                .message("Avatar updated successfully")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Update user info", description = "ADMIN any; SUB_ADMIN within department; users can update their own phone/dateOfBirth via this endpoint too")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN') or #id == principal.id")
    public ResponseEntity<?> updateUser(@PathVariable String id,
                                        @RequestBody @Valid UpdateUserRequest request,
                                        Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        PublicUser resp = userManagementService.updateUser(id, request, currentUser);

        ApiResponse<PublicUser> api = ApiResponse.<PublicUser>builder()
                .status(HttpStatus.OK.value())
                .message("User updated successfully")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Reset user password", description = "ADMIN any; SUB_ADMIN within department; users reset own password via /users/change-password")
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable String id,
                                           @RequestBody @Valid ResetPasswordRequest request,
                                           Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        userManagementService.resetPassword(id, request, currentUser);

        ApiResponse<Void> api = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Password reset successfully")
                .data(null)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete user", description = "ADMIN any; SUB_ADMIN only within their department and cannot delete ADMIN")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        userManagementService.deleteUser(id, currentUser);

        ApiResponse<Void> api = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("User deleted successfully")
                .build();

        return ResponseEntity.ok(api);
    }
}
