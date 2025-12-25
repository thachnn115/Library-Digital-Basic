package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.TrainingProgramRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.TrainingProgramResponse;
import be.library_digital.demo.service.TrainingProgramService;
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
@RequestMapping("/program")
@RequiredArgsConstructor
@Tag(name = "Training Program Controller")
@Slf4j(topic = "TRAINING-PROGRAM-CONTROLLER")
public class TrainingProgramController {

    private final TrainingProgramService trainingProgramService;

    @Operation(summary = "Create training program", description = "ADMIN only")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid TrainingProgramRequest request) {
        TrainingProgramResponse resp = trainingProgramService.create(request);
        ApiResponse<TrainingProgramResponse> api = ApiResponse.<TrainingProgramResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Training program created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update training program", description = "ADMIN only")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody @Valid TrainingProgramRequest request) {
        TrainingProgramResponse resp = trainingProgramService.update(id, request);
        ApiResponse<TrainingProgramResponse> api = ApiResponse.<TrainingProgramResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Training program updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get training program by id", description = "ADMIN only")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable String id) {
        TrainingProgramResponse resp = trainingProgramService.getById(id);
        ApiResponse<TrainingProgramResponse> api = ApiResponse.<TrainingProgramResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "List training programs", description = "ADMIN only")
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name
    ) {
        List<TrainingProgramResponse> list = trainingProgramService.getAll(code, name);
        ApiResponse<List<TrainingProgramResponse>> api = ApiResponse.<List<TrainingProgramResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(list)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete training program", description = "ADMIN only")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        trainingProgramService.delete(id);
        ApiResponse<?> api = ApiResponse.builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Training program deleted")
                .build();

        return new ResponseEntity<>(api, HttpStatus.NO_CONTENT);
    }
}
