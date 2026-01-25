package be.library_digital.demo.controller;

import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

@Validated
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Student Controller")
@Slf4j(topic = "STUDENT-CONTROLLER")
public class StudentController {

    private final UserManagementService userManagementService;

    @Operation(summary = "Admin import students from Excel",
            description = "ADMIN only. Columns: email, password, fullName, birthYear, address, phone, classroomCode, status")
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> importStudents(@RequestPart("file") MultipartFile file,
                                            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        int created = userManagementService.importStudents(file, currentUser);

        ApiResponse<Integer> api = ApiResponse.<Integer>builder()
                .status(HttpStatus.CREATED.value())
                .message("Imported students successfully")
                .data(created)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @Operation(summary = "Download student import template",
            description = "ADMIN only. Columns: email, password, fullName, birthYear, address, phone, classroomCode, status")
    @GetMapping("/import-template")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] data = userManagementService.generateStudentImportTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"student-import-template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(data.length)
                .body(data);
    }
}
