package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.ResourceUploadRequest;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.dto.response.ResourceFolderResponse;
import be.library_digital.demo.dto.response.ResourceResponse;
import be.library_digital.demo.model.User;
import be.library_digital.demo.service.ResourceService;
import be.library_digital.demo.dto.request.ResourceApprovalStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.FileSystemResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Validated
@RestController
@RequestMapping("/resource")
@RequiredArgsConstructor
@Tag(name = "Resource Controller")
@Slf4j(topic = "RESOURCE-CONTROLLER")
public class ResourceController {

        private final ResourceService resourceService;
        private final be.library_digital.demo.service.FileConversionService fileConversionService;

        @Operation(summary = "Upload resource", description = "Upload a resource file with metadata (LECTURER only)")
        @PostMapping("/upload")
        @PreAuthorize("hasAuthority('LECTURER')")
        public ResponseEntity<?> uploadResource(
                        @RequestPart("file") MultipartFile file,
                        @RequestPart("data") @Valid ResourceUploadRequest request,
                        Authentication authentication) throws IOException {

                User currentUser = (User) authentication.getPrincipal();
                ResourceResponse resp = resourceService.uploadResource(file, request, currentUser);

                ApiResponse<ResourceResponse> api = ApiResponse.<ResourceResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Resource uploaded successfully")
                                .data(resp)
                                .build();

                return new ResponseEntity<>(api, HttpStatus.CREATED);
        }

        @Operation(summary = "View resource file", description = "ADMIN any; SUB_ADMIN/LECTURER only within their department")
        @GetMapping("/{id}/view")
        @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
        public ResponseEntity<?> view(@PathVariable String id, Authentication authentication) throws IOException {
                User currentUser = (User) authentication.getPrincipal();
                // increase view count when viewing inline
                resourceService.incrementViews(id, currentUser);
                FileSystemResource file = resourceService.viewResourceFile(id, currentUser);

                Path filePath = file.getFile().toPath();
                String filename = file.getFilename();
                String contentType;

                String lowerFilename = filename.toLowerCase();
                if (lowerFilename.endsWith(".docx") || lowerFilename.endsWith(".pptx")) {
                        // Convert to PDF for viewing
                        Path pdfPath = fileConversionService.getConvertedPdf(filePath);
                        file = new FileSystemResource(pdfPath);
                        filename = filename.substring(0, filename.lastIndexOf('.')) + ".pdf";
                        contentType = MediaType.APPLICATION_PDF_VALUE;
                } else {
                        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                        try {
                                contentType = Files.probeContentType(filePath);
                        } catch (IOException ignored) {
                        }
                }

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                                .contentType(MediaType.parseMediaType(contentType != null ? contentType
                                                : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                                .contentLength(file.getFile().length())
                                .body(file);
        }

        @Operation(summary = "Get resource by id", description = "Get a resource by id")
        @GetMapping("/{id}")
        public ResponseEntity<?> getById(@PathVariable String id) {
                ResourceResponse resp = resourceService.getById(id);
                ApiResponse<ResourceResponse> api = ApiResponse.<ResourceResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(resp)
                                .build();

                return ResponseEntity.ok(api);
        }

        // @Operation(summary = "Increase resource views", description = "Increment view
        // counter of a resource")
        // @PostMapping("/{id}/view")
        // @PreAuthorize("permitAll()")
        // public ResponseEntity<?> increaseView(@PathVariable String id, Authentication
        // authentication) {
        // User currentUser = authentication != null ? (User)
        // authentication.getPrincipal() : null;
        // ResourceResponse resp = resourceService.incrementViews(id, currentUser);
        // ApiResponse<ResourceResponse> api = ApiResponse.<ResourceResponse>builder()
        // .status(HttpStatus.OK.value())
        // .message("View increased")
        // .data(resp)
        // .build();

        // return ResponseEntity.ok(api);
        // }

        @Operation(summary = "Download resource file", description = "ADMIN any; SUB_ADMIN/LECTURER only within their department")
        @GetMapping("/{id}/download")
        @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
        public ResponseEntity<?> download(@PathVariable String id, Authentication authentication) {
                User currentUser = (User) authentication.getPrincipal();
                FileSystemResource file = resourceService.downloadResourceFile(id, currentUser);
                String filename = file.getFilename();

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .contentLength(file.getFile().length())
                                .body(file);
        }

        @Operation(summary = "Update resource approval status", description = "ADMIN/SUB_ADMIN only; SUB_ADMIN limited to own department")
        @PutMapping("/{id}/approval-status")
        @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUB_ADMIN')")
        public ResponseEntity<?> updateApprovalStatus(
                        @PathVariable String id,
                        @RequestBody @Valid ResourceApprovalStatusRequest request,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();
                ResourceResponse resp = resourceService.updateApprovalStatus(id, request.getStatus(), currentUser);

                ApiResponse<ResourceResponse> api = ApiResponse.<ResourceResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Approval status updated")
                                .data(resp)
                                .build();

                return ResponseEntity.ok(api);
        }

        @Operation(summary = "Get all resources", description = "Role-based visibility for ADMIN/SUB_ADMIN/LECTURER/public")
        @GetMapping
        @PreAuthorize("permitAll()")
        public ResponseEntity<?> getAll(
                        @RequestParam(name = "typeId", required = false) String typeId,
                        @RequestParam(name = "keyword", required = false) String keyword,
                        Authentication authentication) {
                User currentUser = authentication != null ? (User) authentication.getPrincipal() : null;
                List<ResourceResponse> resp = resourceService.getAll(currentUser, typeId, keyword);
                ApiResponse<List<ResourceResponse>> api = ApiResponse.<List<ResourceResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(resp)
                                .build();

                return ResponseEntity.ok(api);
        }

        @Operation(summary = "Get my uploaded resources", description = "Authenticated users: list resources they uploaded")
        @GetMapping("/my-uploads")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<?> getMyUploads(Authentication authentication) {
                User currentUser = (User) authentication.getPrincipal();
                List<ResourceResponse> resp = resourceService.getMyUploads(currentUser);
                ApiResponse<List<ResourceResponse>> api = ApiResponse.<List<ResourceResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(resp)
                                .build();

                return ResponseEntity.ok(api);
        }

        @Operation(summary = "Search resources (LECTURER only)", description = "Tìm kiếm tài liệu theo học phần + bộ lọc nâng cao (program, specialization, cohort, classroom, lecturer, type)")
        @GetMapping("/search")
        @PreAuthorize("hasAuthority('LECTURER')")
        public ResponseEntity<?> searchForLecturer(
                        @RequestParam(name = "courseKeyword", required = false) String courseKeyword,
                        @RequestParam(name = "programCode", required = false) List<String> programCodes,
                        @RequestParam(name = "specializationCode", required = false) List<String> specializationCodes,
                        @RequestParam(name = "cohortCode", required = false) List<String> cohortCodes,
                        @RequestParam(name = "classroomId", required = false) List<String> classroomIds,
                        @RequestParam(name = "lecturerId", required = false) List<String> lecturerIds,
                        @RequestParam(name = "typeId", required = false) List<String> typeIds,
                        Authentication authentication) {
                User currentUser = (User) authentication.getPrincipal();
                List<ResourceResponse> resp = resourceService.searchForLecturer(
                                currentUser,
                                courseKeyword,
                                programCodes,
                                specializationCodes,
                                cohortCodes,
                                classroomIds,
                                lecturerIds,
                                typeIds);
                ApiResponse<List<ResourceResponse>> api = ApiResponse.<List<ResourceResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(resp)
                                .build();
                return ResponseEntity.ok(api);
        }

        @Operation(summary = "Browse resources by folder hierarchy (LECTURER)", description = "Folder levels: Program -> Specialization -> Course -> Lecturer -> Classroom -> Resources")
        @GetMapping("/browse")
        @PreAuthorize("hasAuthority('LECTURER')")
        public ResponseEntity<?> browse(
                        @RequestParam(name = "programCode", required = false) String programCode,
                        @RequestParam(name = "specializationCode", required = false) String specializationCode,
                        @RequestParam(name = "courseTitle", required = false) String courseTitle,
                        @RequestParam(name = "lecturerId", required = false) String lecturerId,
                        @RequestParam(name = "classroomId", required = false) String classroomId,
                        Authentication authentication) {
                User currentUser = (User) authentication.getPrincipal();
                ResourceFolderResponse resp = resourceService.browseFoldersForLecturer(
                                currentUser,
                                programCode,
                                specializationCode,
                                courseTitle,
                                lecturerId,
                                classroomId);
                ApiResponse<ResourceFolderResponse> api = ApiResponse.<ResourceFolderResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(resp)
                                .build();
                return ResponseEntity.ok(api);
        }

        @Operation(summary = "Delete resource", description = "ADMIN any; LECTURER own uploads; SUB_ADMIN resources in their department")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyAuthority('ADMIN','SUB_ADMIN','LECTURER')")
        public ResponseEntity<?> delete(@PathVariable String id, Authentication authentication) {
                User currentUser = (User) authentication.getPrincipal();
                resourceService.delete(id, currentUser);

                ApiResponse<Void> api = ApiResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("Resource deleted")
                                .build();

                return ResponseEntity.ok(api);
        }
}
