package be.library_digital.demo.controller;

import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.HistoryResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.HistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
@Tag(name = "History Controller")
@Slf4j(topic = "HISTORY-CONTROLLER")
public class HistoryController {

    private final HistoryService historyService;

    @Operation(summary = "Get view history for current user")
    @GetMapping("/views")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getViews(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<HistoryResponse> resp = historyService.getViewHistory(currentUser);

        ApiResponse<List<HistoryResponse>> api = ApiResponse.<List<HistoryResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Get download history for current user")
    @GetMapping("/downloads")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDownloads(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<HistoryResponse> resp = historyService.getDownloadHistory(currentUser);

        ApiResponse<List<HistoryResponse>> api = ApiResponse.<List<HistoryResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();

        return ResponseEntity.ok(api);
    }
}
