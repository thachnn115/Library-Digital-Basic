package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.ClassroomRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.ClassroomResponse;
import be.library_digital.demo.service.ClassroomService;
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
@RequestMapping("/classroom")
@RequiredArgsConstructor
@Tag(name = "Classroom Controller")
@Slf4j(topic = "CLASSROOM-CONTROLLER")
public class ClassroomController {

    private final ClassroomService classroomService;

    @Operation(summary = "Create classroom", description = "ADMIN only")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid ClassroomRequest request) {
        ClassroomResponse resp = classroomService.create(request);
        ApiResponse<ClassroomResponse> api = ApiResponse.<ClassroomResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Classroom created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update classroom", description = "ADMIN only")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid ClassroomRequest request) {
        ClassroomResponse resp = classroomService.update(id, request);
        ApiResponse<ClassroomResponse> api = ApiResponse.<ClassroomResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Classroom updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get classroom by id", description = "ADMIN only")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable String id) {
        ClassroomResponse resp = classroomService.getById(id);
        ApiResponse<ClassroomResponse> api = ApiResponse.<ClassroomResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List classrooms", description = "ADMIN only; optional filter by code, specializationCode, cohortCode")
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String specializationCode,
            @RequestParam(required = false) String cohortCode
    ) {
        List<ClassroomResponse> list = classroomService.getAll(code, specializationCode, cohortCode);
        ApiResponse<List<ClassroomResponse>> api = ApiResponse.<List<ClassroomResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete classroom", description = "ADMIN only")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        classroomService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Classroom deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
