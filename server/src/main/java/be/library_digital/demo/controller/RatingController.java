package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.RatingCreateRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.RatingResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.RatingService;
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

@Validated
@RestController
@RequestMapping("/rating")
@RequiredArgsConstructor
@Tag(name = "Rating Controller")
@Slf4j(topic = "RATING-CONTROLLER")
public class RatingController {

    private final RatingService ratingService;

    @Operation(summary = "Create rating for resource", description = "Any authenticated user can rate an APPROVED resource")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody @Valid RatingCreateRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        RatingResponse resp = ratingService.create(request, currentUser);

        ApiResponse<RatingResponse> api = ApiResponse.<RatingResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Rating created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update own rating", description = "Only rating owner can update")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody @Valid RatingCreateRequest request,
                                    Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        RatingResponse resp = ratingService.update(id, request, currentUser);

        ApiResponse<RatingResponse> api = ApiResponse.<RatingResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Rating updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete own rating", description = "Only rating owner can delete")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        ratingService.delete(id, currentUser);

        ApiResponse<Void> api = ApiResponse.<Void>builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Rating deleted")
                .data(null)
                .build();

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(api);
    }
}
