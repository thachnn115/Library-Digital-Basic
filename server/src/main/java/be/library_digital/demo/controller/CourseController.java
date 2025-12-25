package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.CourseRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.CourseResponse;
import be.library_digital.demo.service.CourseService;
import be.library_digital.demo.model.User;
import org.springframework.security.core.Authentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Course Controller")
@Slf4j(topic = "COURSE-CONTROLLER")
public class CourseController {

    private final CourseService courseService;

    @Operation(summary = "Create course", description = "Create a new course (ADMIN or SUB_ADMIN)")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid CourseRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        CourseResponse resp = courseService.create(request, currentUser);
        ApiResponse<CourseResponse> api = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Course created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Get course by id", description = "Get a course by id")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN', 'LECTURER')")
    public ResponseEntity<?> getById(@PathVariable String id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        CourseResponse resp = courseService.getById(id, currentUser);
        ApiResponse<CourseResponse> api = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List courses", description = "List all courses")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN', 'LECTURER')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String cohortCode,
            @RequestParam(required = false) String specializationCode,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String departmentCode,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        List<CourseResponse> list = courseService.getAll(currentUser, cohortCode, specializationCode, title, departmentCode);
        ApiResponse<List<CourseResponse>> api = ApiResponse.<List<CourseResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Update course", description = "Update a course by id (ADMIN or SUB_ADMIN of same department)")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid CourseRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        CourseResponse resp = courseService.update(id, request, currentUser);
        ApiResponse<CourseResponse> api = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Course updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete course", description = "Delete a course by id (ADMIN or SUB_ADMIN of same department)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        courseService.delete(id, currentUser);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Course deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
