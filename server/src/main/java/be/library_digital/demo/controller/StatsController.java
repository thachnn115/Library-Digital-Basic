package be.library_digital.demo.controller;

import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.ResourceResponse;
import be.library_digital.demo.dto.response.TopResourceResponse;
import be.library_digital.demo.dto.response.TopUploaderResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.StatsService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics Controller")
@Slf4j(topic = "STATS-CONTROLLER")
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "Top uploaders", description = "ADMIN: toàn hệ thống; SUB_ADMIN: trong khoa của mình")
    @GetMapping("/top-uploaders")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> topUploaders(@RequestParam(defaultValue = "5") int limit,
                                          Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<TopUploaderResponse> resp = statsService.topUploaders(currentUser, limit);
        ApiResponse<List<TopUploaderResponse>> api = ApiResponse.<List<TopUploaderResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();
        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Top resources by views/downloads", description = "sort=views|downloads|combined; ADMIN: toàn hệ thống; SUB_ADMIN: trong khoa của mình")
    @GetMapping("/top-resources")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> topResources(@RequestParam(defaultValue = "views") String sort,
                                          @RequestParam(defaultValue = "5") int limit,
                                          Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<TopResourceResponse> resp = statsService.topResources(currentUser, sort, limit);
        ApiResponse<List<TopResourceResponse>> api = ApiResponse.<List<TopResourceResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();
        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Recent uploads", description = "Tài liệu upload gần nhất; ADMIN: toàn hệ thống; SUB_ADMIN: trong khoa của mình")
    @GetMapping("/recent-uploads")
    @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN')")
    public ResponseEntity<?> recentUploads(@RequestParam(defaultValue = "10") int limit,
                                           Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<ResourceResponse> resp = statsService.recentUploads(currentUser, limit);
        ApiResponse<List<ResourceResponse>> api = ApiResponse.<List<ResourceResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(resp)
                .build();
        return ResponseEntity.ok(api);
    }

    @Operation(summary = "Storage usage", description = "Tổng dung lượng đã sử dụng; chỉ ADMIN")
    @GetMapping("/storage-usage")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> storageUsage(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long usage = statsService.storageUsage(currentUser);
        ApiResponse<Long> api = ApiResponse.<Long>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(usage)
                .build();
        return ResponseEntity.ok(api);
    }
}
