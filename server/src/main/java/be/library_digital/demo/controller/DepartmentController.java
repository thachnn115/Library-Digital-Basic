package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.DepartmentRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.DepartmentResponse;
import be.library_digital.demo.service.DepartmentService;
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
@RequestMapping("/department")
@RequiredArgsConstructor
@Tag(name = "Department Controller")
@Slf4j(topic = "DEPARTMENT-CONTROLLER")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(summary = "Create department", description = "Create a new department (ADMIN only)")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid DepartmentRequest request) {
        DepartmentResponse resp = departmentService.create(request);
        ApiResponse<DepartmentResponse> api = ApiResponse.<DepartmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Department created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Get department by id", description = "Get a department by id (ADMIN only)")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        DepartmentResponse resp = departmentService.getById(id);
        ApiResponse<DepartmentResponse> api = ApiResponse.<DepartmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List departments", description = "List all departments (ADMIN only)")
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name
    ) {
        List<DepartmentResponse> list = departmentService.getAll(code, name);
        ApiResponse<List<DepartmentResponse>> api = ApiResponse.<List<DepartmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Update department", description = "Update a department by id (ADMIN only)")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody @Valid DepartmentRequest request) {
        DepartmentResponse resp = departmentService.update(id, request);
        ApiResponse<DepartmentResponse> api = ApiResponse.<DepartmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Department updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete department", description = "Delete a department by id (ADMIN only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        departmentService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Department deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
