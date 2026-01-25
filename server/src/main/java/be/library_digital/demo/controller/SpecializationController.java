package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.SpecializationRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.SpecializationResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.SpecializationService;
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

import java.util.List;

@Validated
@RestController
@RequestMapping("/specialization")
@RequiredArgsConstructor
@Tag(name = "Specialization Controller")
@Slf4j(topic = "SPECIALIZATION-CONTROLLER")
public class SpecializationController {

    private final SpecializationService specializationService;

    @Operation(summary = "Create specialization", description = "ADMIN only")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid SpecializationRequest request) {
        SpecializationResponse resp = specializationService.create(request);
        ApiResponse<SpecializationResponse> api = ApiResponse.<SpecializationResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Specialization created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update specialization", description = "ADMIN only")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid SpecializationRequest request) {
        SpecializationResponse resp = specializationService.update(id, request);
        ApiResponse<SpecializationResponse> api = ApiResponse.<SpecializationResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Specialization updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get specialization by id", description = "ADMIN only")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
    public ResponseEntity<?> getById(@PathVariable String id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        SpecializationResponse resp = specializationService.getById(id, currentUser);
        ApiResponse<SpecializationResponse> api = ApiResponse.<SpecializationResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List specializations", description = "ADMIN all; SUB_ADMIN/LECTURER all; optional filters")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String programId,
            @RequestParam(required = false) String programCode,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        List<SpecializationResponse> list = specializationService.getAll(currentUser, programId, programCode, code, name);
        ApiResponse<List<SpecializationResponse>> api = ApiResponse.<List<SpecializationResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete specialization", description = "ADMIN only")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        specializationService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Specialization deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
