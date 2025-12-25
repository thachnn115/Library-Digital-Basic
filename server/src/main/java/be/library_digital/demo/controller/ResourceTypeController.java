package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.ResourceTypeRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.ResourceTypeResponse;
import be.library_digital.demo.service.ResourceTypeService;
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
@RequestMapping("/resource-type")
@RequiredArgsConstructor
@Tag(name = "Resource Type Controller")
@Slf4j(topic = "RESOURCE-TYPE-CONTROLLER")
public class ResourceTypeController {

    private final ResourceTypeService resourceTypeService;

    @Operation(summary = "Create resource type", description = "ADMIN only")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid ResourceTypeRequest request) {
        ResourceTypeResponse resp = resourceTypeService.create(request);
        ApiResponse<ResourceTypeResponse> api = ApiResponse.<ResourceTypeResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Resource type created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update resource type", description = "ADMIN only")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid ResourceTypeRequest request) {
        ResourceTypeResponse resp = resourceTypeService.update(id, request);
        ApiResponse<ResourceTypeResponse> api = ApiResponse.<ResourceTypeResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Resource type updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get resource type by id")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        ResourceTypeResponse resp = resourceTypeService.getById(id);
        ApiResponse<ResourceTypeResponse> api = ApiResponse.<ResourceTypeResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List resource types", description = "PUBLIC")
    @GetMapping
    public ResponseEntity<?> list() {
        List<ResourceTypeResponse> list = resourceTypeService.getAll();
        ApiResponse<List<ResourceTypeResponse>> api = ApiResponse.<List<ResourceTypeResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete resource type", description = "ADMIN only")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        resourceTypeService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Resource type deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
