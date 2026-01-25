package be.library_digital.demo.service;

import be.library_digital.demo.common.ApprovalStatus;
import be.library_digital.demo.dto.request.ResourceUploadRequest;
import be.library_digital.demo.dto.response.ResourceResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.Course;
import be.library_digital.demo.model.Specialization;
import be.library_digital.demo.model.Resource;
import be.library_digital.demo.model.ResourceTypeEntity;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.CourseRepository;
import be.library_digital.demo.repository.ResourceRepository;
import be.library_digital.demo.repository.CommentRepository;
import be.library_digital.demo.repository.RatingRepository;
import be.library_digital.demo.repository.HistoryRepository;
import be.library_digital.demo.repository.ResourceTypeRepository;
import be.library_digital.demo.repository.SpecializationRepository;
import be.library_digital.demo.model.Comment;
import be.library_digital.demo.model.Rating;
import be.library_digital.demo.model.History;
import be.library_digital.demo.dto.response.CommentResponse;
import be.library_digital.demo.dto.response.ResourceStats;
import be.library_digital.demo.dto.response.BreadcrumbItem;
import be.library_digital.demo.dto.response.FolderNodeResponse;
import be.library_digital.demo.dto.response.ResourceFolderResponse;
import be.library_digital.demo.common.HistoryAction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.Set;
import java.util.Collections;
import java.util.ArrayList;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESOURCE-SERVICE")
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final ResourceTypeRepository resourceTypeRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;
    private final HistoryRepository historyRepository;
    private final SpecializationRepository specializationRepository;

    @Value("${file.upload-dir:uploads/library-resources}")
    private String uploadDir;

    public ResourceResponse uploadResource(MultipartFile file, ResourceUploadRequest request, User currentUser)
            throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        ResourceTypeEntity type = resourceTypeRepository.findById(request.getResourceTypeId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Resource type not found"));

        if (currentUser.getDepartment() == null ||
                course.getDepartment() == null ||
                !course.getDepartment().getId().equals(currentUser.getDepartment().getId())) {
            throw new ForbiddenException("You can only upload resources to courses in your department");
        }
        // Save file to local upload directory
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }

        Resource resource = new Resource();
        resource.setTitle(request.getTitle());
        resource.setDescription(request.getDescription());
        resource.setCourse(course);
        resource.setType(type);
        resource.setUploadedBy(currentUser);
        resource.setApprovalStatus(ApprovalStatus.APPROVED);
        resource.setViews(0);
        resource.setDownloads(0);

        // Save first to get generated id for filename
        Resource saved = resourceRepository.save(resource);

        String filename = saved.getId() + ext;
        Path dirPath = Paths.get(uploadDir, course.getId()).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        Path target = dirPath.resolve(filename);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target);
        }

        saved.setFileUrl(target.toString());
        saved.setSizeBytes(file.getSize());
        Resource savedWithFile = resourceRepository.save(saved);
        log.info("Uploaded resource id={}, file={}", savedWithFile.getId(), target);
        return ResourceResponse.fromResource(savedWithFile);
    }

    public ResourceResponse getById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        return toResourceResponseWithStats(resource);
    }

    public List<ResourceResponse> getAll(User currentUser, String typeId, String keyword) {
        UserType userType = currentUser != null ? currentUser.getType() : null;
        List<Resource> resources;

        if (UserType.ADMIN.equals(userType)) {
            resources = resourceRepository.findAll();
        } else if (UserType.SUB_ADMIN.equals(userType)) {
            if (currentUser.getDepartment() == null) {
                throw new ForbiddenException("SUB_ADMIN user must belong to a department");
            }
            resources = resourceRepository.findByUploadedBy_Department_Id(currentUser.getDepartment().getId());
        } else if (UserType.LECTURER.equals(userType)) {
            resources = resourceRepository.findByUploadedBy_Id(currentUser.getId());
        } else {
            resources = resourceRepository.findByApprovalStatus(ApprovalStatus.APPROVED);
        }

        String normalizedKeyword = keyword != null ? keyword.trim().toLowerCase() : null;

        return resources.stream()
                .filter(r -> {
                    if (typeId == null || typeId.isBlank())
                        return true;
                    return r.getType() != null && typeId.equals(r.getType().getId());
                })
                .filter(r -> matchesKeyword(r, normalizedKeyword))
                .map(this::toResourceResponseWithStats)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getMyUploads(User currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("You must be logged in to view your uploads");
        }
        return resourceRepository.findByUploadedBy_Id(currentUser.getId()).stream()
                .map(this::toResourceResponseWithStats)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> searchForLecturer(User currentUser,
            String courseKeyword,
            List<String> programCodes,
            List<String> specializationCodes,
            List<String> cohortCodes,
            List<String> classroomIds,
            List<String> lecturerIds,
            List<String> typeIds) {
        if (currentUser == null || !UserType.LECTURER.equals(currentUser.getType())) {
            throw new ForbiddenException("Only LECTURER can search resources");
        }
        if (currentUser.getDepartment() == null) {
            throw new ForbiddenException("LECTURER must belong to a department");
        }

        String keyword = courseKeyword != null ? courseKeyword.trim().toLowerCase() : null;
        var programSet = normalizeSet(programCodes);
        var specSet = normalizeSet(specializationCodes);
        var cohortSet = normalizeSet(cohortCodes);
        var classSet = normalizeSet(classroomIds);
        var lecturerSet = normalizeSet(lecturerIds);
        var typeSet = normalizeSet(typeIds);
        Long deptId = currentUser.getDepartment().getId();

        return resourceRepository.findAll().stream()
                .filter(r -> {
                    // must be same department as lecturer (by uploader)
                    return r.getUploadedBy() != null &&
                            r.getUploadedBy().getDepartment() != null &&
                            deptId.equals(r.getUploadedBy().getDepartment().getId());
                })
                .filter(r -> keyword == null ||
                        (r.getCourse() != null &&
                                ((r.getCourse().getTitle() != null
                                        && r.getCourse().getTitle().toLowerCase().contains(keyword)) ||
                                        (r.getCourse().getCode() != null
                                                && r.getCourse().getCode().toLowerCase().contains(keyword)))))
                .filter(r -> programSet.isEmpty() ||
                        hasProgramCode(r.getCourse() != null && r.getCourse().getClassroom() != null
                                ? r.getCourse().getClassroom().getSpecialization()
                                : null, programSet))
                .filter(r -> specSet.isEmpty() ||
                        (r.getCourse() != null && r.getCourse().getClassroom() != null &&
                                r.getCourse().getClassroom().getSpecialization() != null &&
                                r.getCourse().getClassroom().getSpecialization().getCode() != null &&
                                specSet.contains(
                                        r.getCourse().getClassroom().getSpecialization().getCode().toLowerCase())))
                .filter(r -> cohortSet.isEmpty() ||
                        (r.getCourse() != null && r.getCourse().getClassroom() != null &&
                                r.getCourse().getClassroom().getCohort() != null &&
                                r.getCourse().getClassroom().getCohort().getCode() != null &&
                                cohortSet.contains(r.getCourse().getClassroom().getCohort().getCode().toLowerCase())))
                .filter(r -> classSet.isEmpty() ||
                        (r.getCourse() != null && r.getCourse().getClassroom() != null &&
                                r.getCourse().getClassroom().getId() != null &&
                                classSet.contains(r.getCourse().getClassroom().getId().toLowerCase())))
                .filter(r -> lecturerSet.isEmpty() ||
                        (r.getUploadedBy() != null && r.getUploadedBy().getId() != null &&
                                lecturerSet.contains(r.getUploadedBy().getId().toLowerCase())))
                .filter(r -> typeSet.isEmpty() ||
                        (r.getType() != null && r.getType().getId() != null &&
                                typeSet.contains(r.getType().getId().toLowerCase())))
                .filter(r -> ApprovalStatus.APPROVED.equals(r.getApprovalStatus()))
                .map(this::toResourceResponseWithStats)
                .collect(Collectors.toList());
    }

    public ResourceFolderResponse browseFoldersForLecturer(User currentUser,
            String programCode,
            String specializationCode,
            String courseTitle,
            String lecturerId,
            String classroomId) {
        if (currentUser == null || !UserType.LECTURER.equals(currentUser.getType())) {
            throw new ForbiddenException("Only LECTURER can browse resources");
        }
        if (currentUser.getDepartment() == null) {
            throw new ForbiddenException("LECTURER must belong to a department");
        }
        Long deptId = currentUser.getDepartment().getId();
        Set<String> deptSpecializationIds = resolveSpecializationIdsByInstructorDept(deptId);
        String currentUrl = buildBrowseUrl(programCode, specializationCode, courseTitle, lecturerId, classroomId);
        String parentUrl = buildParentUrl(currentUrl);
        List<BreadcrumbItem> breadcrumbs = buildBreadcrumbs(programCode, specializationCode, courseTitle, lecturerId,
                classroomId);

        // level 6: resources for classroom + lecturer + courseTitle
        if (classroomId != null && lecturerId != null && courseTitle != null) {
            String titleLower = courseTitle.trim().toLowerCase();
            List<ResourceResponse> resources = resourceRepository.findAll().stream()
                    .filter(r -> ApprovalStatus.APPROVED.equals(r.getApprovalStatus()))
                    .filter(r -> r.getCourse() != null && r.getCourse().getClassroom() != null &&
                            classroomId.equals(r.getCourse().getClassroom().getId()))
                    .filter(r -> r.getCourse().getTitle() != null &&
                            r.getCourse().getTitle().toLowerCase().equals(titleLower))
                    .filter(r -> r.getUploadedBy() != null && lecturerId.equals(r.getUploadedBy().getId()))
                    .filter(r -> r.getUploadedBy().getDepartment() != null &&
                            deptId.equals(r.getUploadedBy().getDepartment().getId()))
                    .map(this::toResourceResponseWithStats)
                    .collect(Collectors.toList());
            return ResourceFolderResponse.builder()
                    .level("RESOURCE")
                    .resources(resources)
                    .currentUrl(currentUrl)
                    .parentUrl(parentUrl)
                    .breadcrumbs(breadcrumbs)
                    .nextParam(null)
                    .build();
        }

        // level 5: classrooms where lecturer taught courses with this title
        if (lecturerId != null && courseTitle != null) {
            String titleLower = courseTitle.trim().toLowerCase();
            List<FolderNodeResponse> nodes = resourceRepository.findAll().stream()
                    .filter(r -> ApprovalStatus.APPROVED.equals(r.getApprovalStatus()))
                    .filter(r -> r.getCourse() != null && r.getCourse().getClassroom() != null)
                    .filter(r -> r.getCourse().getTitle() != null &&
                            r.getCourse().getTitle().toLowerCase().equals(titleLower))
                    .filter(r -> r.getUploadedBy() != null && lecturerId.equals(r.getUploadedBy().getId()))
                    .filter(r -> r.getUploadedBy().getDepartment() != null &&
                            deptId.equals(r.getUploadedBy().getDepartment().getId()))
                    .collect(Collectors.toMap(
                            r -> r.getCourse().getClassroom().getId(),
                            r -> FolderNodeResponse.builder()
                                    .type("CLASSROOM")
                                    .id(r.getCourse().getClassroom().getId())
                                    .code(r.getCourse().getClassroom().getCode())
                                    .name(r.getCourse().getClassroom().getName())
                                    .build(),
                            (a, b) -> a))
                    .values().stream().collect(Collectors.toList());
            return ResourceFolderResponse.builder()
                    .level("CLASSROOM")
                    .nodes(nodes)
                    .currentUrl(currentUrl)
                    .parentUrl(parentUrl)
                    .breadcrumbs(breadcrumbs)
                    .nextParam("classroomId")
                    .build();
        }

        // level 4: lecturers who taught (uploaded) courses with this title
        if (courseTitle != null) {
            String titleLower = courseTitle.trim().toLowerCase();
            List<FolderNodeResponse> lecturers = resourceRepository.findAll().stream()
                    .filter(r -> ApprovalStatus.APPROVED.equals(r.getApprovalStatus()))
                    .filter(r -> r.getCourse() != null && r.getCourse().getTitle() != null &&
                            r.getCourse().getTitle().toLowerCase().equals(titleLower))
                    .map(Resource::getUploadedBy)
                    .filter(u -> u != null && UserType.LECTURER.equals(u.getType()) &&
                            u.getDepartment() != null && deptId.equals(u.getDepartment().getId()))
                    .collect(Collectors.toMap(
                            User::getId,
                            u -> FolderNodeResponse.builder()
                                    .type("LECTURER")
                                    .id(u.getId())
                                    .code(u.getEmail())
                                    .name(u.getFullName())
                                    .build(),
                            (a, b) -> a))
                    .values().stream().collect(Collectors.toList());
            return ResourceFolderResponse.builder()
                    .level("LECTURER")
                    .nodes(lecturers)
                    .currentUrl(currentUrl)
                    .parentUrl(parentUrl)
                    .breadcrumbs(breadcrumbs)
                    .nextParam("lecturerId")
                    .build();
        }

        // level 3: course titles under specialization
        if (specializationCode != null) {
            var spec = specializationRepository.findByCodeIgnoreCase(specializationCode.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
            if (!deptSpecializationIds.contains(spec.getId())) {
                throw new ForbiddenException("Specialization not in your department");
            }
            List<FolderNodeResponse> courses = courseRepository.findAll().stream()
                    .filter(c -> c.getClassroom() != null && c.getClassroom().getSpecialization() != null &&
                            spec.getId().equals(c.getClassroom().getSpecialization().getId()))
                    .filter(c -> c.getDepartment() != null &&
                            deptId.equals(c.getDepartment().getId()))
                    .filter(c -> c.getTitle() != null)
                    .collect(Collectors.toMap(
                            c -> c.getTitle().toLowerCase(),
                            c -> FolderNodeResponse.builder()
                                    .type("COURSE_TITLE")
                                    .id(c.getTitle()) // use title as id
                                    .name(c.getTitle())
                                    .build(),
                            (a, b) -> a))
                    .values().stream().collect(Collectors.toList());
            return ResourceFolderResponse.builder()
                    .level("COURSE_TITLE")
                    .nodes(courses)
                    .currentUrl(currentUrl)
                    .parentUrl(parentUrl)
                    .breadcrumbs(breadcrumbs)
                    .nextParam("courseTitle")
                    .build();
        }

        // level 2: specializations under program (same department)
        if (programCode != null) {
            String programCodeFilter = programCode.trim().toLowerCase();
            List<FolderNodeResponse> specs = specializationRepository.findAll().stream()
                    .filter(s -> deptSpecializationIds.contains(s.getId()))
                    .filter(s -> hasProgramCode(s, Set.of(programCodeFilter)))
                    .map(s -> FolderNodeResponse.builder()
                            .type("SPECIALIZATION")
                            .id(s.getId())
                            .code(s.getCode())
                            .name(s.getName())
                            .build())
                    .collect(Collectors.toList());
            return ResourceFolderResponse.builder()
                    .level("SPECIALIZATION")
                    .nodes(specs)
                    .currentUrl(currentUrl)
                    .parentUrl(parentUrl)
                    .breadcrumbs(breadcrumbs)
                    .nextParam("specializationCode")
                    .build();
        }

        // level 1: top-level programs within lecturer's department (through
        // specializations)
        List<FolderNodeResponse> programs = specializationRepository.findAll().stream()
                .filter(s -> deptSpecializationIds.contains(s.getId()))
                .filter(s -> s.getPrograms() != null && !s.getPrograms().isEmpty())
                .flatMap(s -> s.getPrograms().stream())
                .filter(p -> p != null && p.getCode() != null)
                .collect(Collectors.toMap(
                        p -> p.getCode(),
                        p -> FolderNodeResponse.builder()
                                .type("PROGRAM")
                                .id(p.getId())
                                .code(p.getCode())
                                .name(p.getName())
                                .build(),
                        (a, b) -> a))
                .values().stream().collect(Collectors.toList());

        return ResourceFolderResponse.builder()
                .level("PROGRAM")
                .nodes(programs)
                .currentUrl(currentUrl)
                .parentUrl(parentUrl)
                .breadcrumbs(breadcrumbs)
                .nextParam("programCode")
                .build();
    }

    public ResourceResponse updateApprovalStatus(String resourceId, ApprovalStatus status, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        enforceAdminOrSubAdminOnSameDepartment(resource, currentUser);

        resource.setApprovalStatus(status);
        Resource saved = resourceRepository.save(resource);
        log.info("Updated approval status for resource id={} to {}", resourceId, status);
        return ResourceResponse.fromResource(saved);
    }

    public ResourceResponse incrementViews(String resourceId, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!ApprovalStatus.APPROVED.equals(resource.getApprovalStatus())) {
            throw new ForbiddenException("Resource is not approved");
        }

        Integer currentViews = resource.getViews() != null ? resource.getViews() : 0;
        resource.setViews(currentViews + 1);

        Resource saved = resourceRepository.save(resource);
        saveHistory(currentUser, saved, HistoryAction.VIEW);
        log.info("Incremented views for resource id={} to {}", resourceId, saved.getViews());
        return ResourceResponse.fromResource(saved);
    }

    public FileSystemResource downloadResourceFile(String resourceId, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to download this resource");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        enforceDepartmentAccess(resource, currentUser);

        Path filePath = Paths.get(resource.getFileUrl()).toAbsolutePath().normalize();
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("File not found");
        }

        Integer currentDownloads = resource.getDownloads() != null ? resource.getDownloads() : 0;
        resource.setDownloads(currentDownloads + 1);
        resourceRepository.saveAndFlush(resource);
        log.info("Incremented downloads for resource id={} to {}", resourceId, resource.getDownloads());

        saveHistory(currentUser, resource, HistoryAction.DOWNLOAD);
        return new FileSystemResource(filePath);
    }

    public FileSystemResource viewResourceFile(String resourceId, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to view this resource");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        enforceDepartmentAccess(resource, currentUser);

        Path filePath = Paths.get(resource.getFileUrl()).toAbsolutePath().normalize();
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("File not found");
        }

        return new FileSystemResource(filePath);
    }

    @Transactional
    public void delete(String resourceId, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to delete this resource");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        UserType userType = currentUser.getType();
        if (UserType.ADMIN.equals(userType)) {
            // ADMIN can delete any resource
        } else if (UserType.SUB_ADMIN.equals(userType)) {
            // SUB_ADMIN: same department as resource
            enforceDepartmentAccess(resource, currentUser);
        } else if (UserType.LECTURER.equals(userType)) {
            // LECTURER: must be the uploader
            if (resource.getUploadedBy() == null || !resource.getUploadedBy().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only delete resources you uploaded");
            }
        } else {
            throw new ForbiddenException("You don't have permission to delete this resource");
        }

        // try removing physical file
        if (resource.getFileUrl() != null) {
            Path filePath = Paths.get(resource.getFileUrl()).toAbsolutePath().normalize();
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("Failed to delete file {} for resource {}: {}", filePath, resourceId, e.getMessage());
            }
        }

        deleteResourceRelations(resourceId);
        resourceRepository.delete(resource);
        log.info("Deleted resource id={}", resourceId);
    }

    protected void deleteResourceRelations(String resourceId) {
        // Remove dependent rows to avoid FK constraint errors
        commentRepository.deleteByResource_Id(resourceId);
        ratingRepository.deleteByResource_Id(resourceId);
        historyRepository.deleteByResource_Id(resourceId);
    }

    private boolean matchesKeyword(Resource resource, String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return true;
        }

        String title = resource.getTitle() != null ? resource.getTitle().toLowerCase() : "";
        String description = resource.getDescription() != null ? resource.getDescription().toLowerCase() : "";
        String uploaderName = resource.getUploadedBy() != null && resource.getUploadedBy().getFullName() != null
                ? resource.getUploadedBy().getFullName().toLowerCase()
                : "";
        String uploaderEmail = resource.getUploadedBy() != null && resource.getUploadedBy().getEmail() != null
                ? resource.getUploadedBy().getEmail().toLowerCase()
                : "";

        return title.contains(keyword) ||
                description.contains(keyword) ||
                uploaderName.contains(keyword) ||
                uploaderEmail.contains(keyword);
    }

    private ResourceResponse toResourceResponseWithStats(Resource resource) {
        ResourceResponse response = ResourceResponse.fromResource(resource);
        if (response == null || resource == null) {
            return response;
        }

        List<Comment> comments = commentRepository.findByResource_IdOrderByCreatedAtDesc(resource.getId());
        List<Rating> ratings = ratingRepository.findByResource_Id(resource.getId());
        long downloadCount = resource.getDownloads() != null ? resource.getDownloads().longValue() : 0L;
        if (resource.getId() != null) {
            downloadCount = Math.max(downloadCount,
                    historyRepository.countByResource_IdAndAction(resource.getId(), HistoryAction.DOWNLOAD));
        }

        ResourceStats stats = ResourceStats.builder()
                .views(resource.getViews() != null ? resource.getViews().longValue() : 0L)
                .downloads(downloadCount)
                .comments(comments.stream().map(CommentResponse::fromComment).collect(Collectors.toList()))
                .ratingCount(ratings.size())
                .ratingAverage(ratings.isEmpty() ? 0D
                        : ratings.stream()
                                .mapToInt(Rating::getRate)
                                .average()
                                .orElse(0D))
                .build();

        response.setStats(stats);
        return response;
    }

    private void saveHistory(User user, Resource resource, HistoryAction action) {
        if (user == null || resource == null) {
            return;
        }

        History history = History.builder()
                .action(action)
                .user(user)
                .resource(resource)
                .build();
        historyRepository.save(history);
        log.info("Saved history action={} for resource={} by user={}", action, resource.getId(), user.getId());
    }

    private void enforceAdminOrSubAdminOnSameDepartment(Resource resource, User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission to perform this action");
        }

        if (UserType.ADMIN.equals(currentUser.getType())) {
            return;
        }

        if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
            if (resource == null || resource.getUploadedBy() == null ||
                    resource.getUploadedBy().getDepartment() == null ||
                    currentUser.getDepartment() == null ||
                    !resource.getUploadedBy().getDepartment().getId().equals(currentUser.getDepartment().getId())) {
                throw new ForbiddenException("You don't have permission to perform this action");
            }
            return;
        }

        throw new ForbiddenException("You don't have permission to perform this action");
    }

    private void enforceDepartmentAccess(Resource resource, User currentUser) {
        if (UserType.ADMIN.equals(currentUser.getType())) {
            return;
        }
        if ((UserType.SUB_ADMIN.equals(currentUser.getType()) || UserType.LECTURER.equals(currentUser.getType()))
                && resource.getUploadedBy() != null
                && resource.getUploadedBy().getDepartment() != null
                && currentUser.getDepartment() != null
                && currentUser.getDepartment().getId().equals(resource.getUploadedBy().getDepartment().getId())) {
            return;
        }
        throw new ForbiddenException("You don't have permission to view this resource");
    }

    private boolean hasProgramCode(Specialization specialization, Set<String> programCodes) {
        if (specialization == null || programCodes == null || programCodes.isEmpty()) {
            return false;
        }
        if (specialization.getPrograms() == null || specialization.getPrograms().isEmpty()) {
            return false;
        }
        return specialization.getPrograms().stream()
                .filter(program -> program != null && program.getCode() != null)
                .anyMatch(program -> programCodes.contains(program.getCode().toLowerCase()));
    }

    private Set<String> resolveSpecializationIdsByInstructorDept(Long deptId) {
        return courseRepository.findAll().stream()
                .filter(course -> course.getDepartment() != null &&
                        deptId.equals(course.getDepartment().getId()))
                .filter(course -> course.getClassroom() != null &&
                        course.getClassroom().getSpecialization() != null)
                .map(course -> course.getClassroom().getSpecialization().getId())
                .collect(Collectors.toSet());
    }

    private Set<String> normalizeSet(List<String> values) {
        if (values == null || values.isEmpty()) {
            return Collections.emptySet();
        }
        return values.stream()
                .filter(v -> v != null && !v.isBlank())
                .map(v -> v.trim().toLowerCase())
                .collect(Collectors.toSet());
    }

    private String buildBrowseUrl(String programCode, String specializationCode, String courseTitle,
            String lecturerId, String classroomId) {
        StringBuilder sb = new StringBuilder("/resource/browse");
        boolean first = true;
        if (programCode != null) {
            sb.append(first ? "?" : "&").append("programCode=").append(programCode);
            first = false;
        }
        if (specializationCode != null) {
            sb.append(first ? "?" : "&").append("specializationCode=").append(specializationCode);
            first = false;
        }
        if (courseTitle != null) {
            sb.append(first ? "?" : "&").append("courseTitle=").append(courseTitle);
            first = false;
        }
        if (lecturerId != null) {
            sb.append(first ? "?" : "&").append("lecturerId=").append(lecturerId);
            first = false;
        }
        if (classroomId != null) {
            sb.append(first ? "?" : "&").append("classroomId=").append(classroomId);
        }
        return sb.toString();
    }

    private String buildParentUrl(String currentUrl) {
        if (currentUrl == null || !currentUrl.contains("?"))
            return null;
        int idx = currentUrl.lastIndexOf("&");
        if (idx == -1) {
            return null; // only one param -> parent is root
        }
        return currentUrl.substring(0, idx);
    }

    private List<BreadcrumbItem> buildBreadcrumbs(String programCode,
            String specializationCode,
            String courseTitle,
            String lecturerId,
            String classroomId) {
        List<BreadcrumbItem> crumbs = new ArrayList<>();
        crumbs.add(BreadcrumbItem.builder()
                .label("Programs")
                .url("/resource/browse")
                .build());

        if (programCode != null) {
            String url = buildBrowseUrl(programCode, null, null, null, null);
            crumbs.add(BreadcrumbItem.builder()
                    .label("Program: " + programCode)
                    .url(url)
                    .build());
        }
        if (specializationCode != null) {
            String url = buildBrowseUrl(programCode, specializationCode, null, null, null);
            crumbs.add(BreadcrumbItem.builder()
                    .label("Specialization: " + specializationCode)
                    .url(url)
                    .build());
        }
        if (courseTitle != null) {
            String url = buildBrowseUrl(programCode, specializationCode, courseTitle, null, null);
            crumbs.add(BreadcrumbItem.builder()
                    .label("Course: " + courseTitle)
                    .url(url)
                    .build());
        }
        if (lecturerId != null) {
            String url = buildBrowseUrl(programCode, specializationCode, courseTitle, lecturerId, null);
            crumbs.add(BreadcrumbItem.builder()
                    .label("Lecturer: " + lecturerId)
                    .url(url)
                    .build());
        }
        if (classroomId != null) {
            String url = buildBrowseUrl(programCode, specializationCode, courseTitle, lecturerId, classroomId);
            crumbs.add(BreadcrumbItem.builder()
                    .label("Classroom: " + classroomId)
                    .url(url)
                    .build());
        }
        return crumbs;
    }
}
