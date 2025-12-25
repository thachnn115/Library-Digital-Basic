package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.CommentRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.CommentResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.CommentService;
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
@RequestMapping("/comment")
@RequiredArgsConstructor
@Tag(name = "Comment Controller")
@Slf4j(topic = "COMMENT-CONTROLLER")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Create comment for resource", description = "Any authenticated user can comment on APPROVED resources")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody @Valid CommentRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        CommentResponse resp = commentService.create(request, currentUser);

        ApiResponse<CommentResponse> api = ApiResponse.<CommentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Comment created")
                .data(resp)
                .build();

        return new ResponseEntity<>(api, HttpStatus.CREATED);
    }

    @Operation(summary = "Update own comment", description = "Only comment owner can update")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody @Valid CommentRequest request,
                                    Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        CommentResponse resp = commentService.update(id, request, currentUser);

        ApiResponse<CommentResponse> api = ApiResponse.<CommentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Comment updated")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Delete comment", description = "Owner can delete; ADMIN can delete any")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        commentService.delete(id, currentUser);

        ApiResponse<Void> api = ApiResponse.<Void>builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Comment deleted")
                .data(null)
                .build();

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(api);
    }
}
