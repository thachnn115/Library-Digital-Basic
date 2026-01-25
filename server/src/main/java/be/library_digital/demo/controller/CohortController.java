package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.CohortRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.CohortResponse;
import be.library_digital.demo.service.CohortService;
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
@RequestMapping("/cohort")
@RequiredArgsConstructor
@Tag(name = "Cohort Controller")
@Slf4j(topic = "COHORT-CONTROLLER")
public class CohortController {

    private final CohortService cohortService;

    @Operation(summary = "Create cohort", description = "ADMIN only")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid CohortRequest request) {
        CohortResponse resp = cohortService.create(request);
        ApiResponse<CohortResponse> api = ApiResponse.<CohortResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Cohort created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update cohort", description = "ADMIN only")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid CohortRequest request) {
        CohortResponse resp = cohortService.update(id, request);
        ApiResponse<CohortResponse> api = ApiResponse.<CohortResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cohort updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get cohort by id", description = "ADMIN only")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable String id) {
        CohortResponse resp = cohortService.getById(id);
        ApiResponse<CohortResponse> api = ApiResponse.<CohortResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List cohorts", description = "ADMIN only; optional filter by code/programCode/startYear/endYear")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUB_ADMIN', 'LECTURER')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String programCode,
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear) {
        List<CohortResponse> list = cohortService.getAll(code, programCode, startYear, endYear);
        ApiResponse<List<CohortResponse>> api = ApiResponse.<List<CohortResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete cohort", description = "ADMIN only")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        cohortService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Cohort deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
