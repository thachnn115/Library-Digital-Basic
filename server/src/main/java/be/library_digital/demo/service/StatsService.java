package be.library_digital.demo.service;

import be.library_digital.demo.common.UserType;
import be.library_digital.demo.dto.response.ResourceResponse;
import be.library_digital.demo.dto.response.TopResourceResponse;
import be.library_digital.demo.dto.response.TopUploaderResponse;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.model.Resource;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.ResourceRepository;
import be.library_digital.demo.repository.projection.UploaderCountProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "STATS-SERVICE")
public class StatsService {

    private final ResourceRepository resourceRepository;

    private Long resolveDeptIdForSubAdmin(User currentUser) {
        if (currentUser == null || currentUser.getType() == null) {
            throw new ForbiddenException("You don't have permission");
        }
        if (UserType.ADMIN.equals(currentUser.getType())) {
            return null;
        }
        if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
            if (currentUser.getDepartment() == null) {
                throw new ForbiddenException("SUB_ADMIN must belong to a department");
            }
            return currentUser.getDepartment().getId();
        }
        throw new ForbiddenException("You don't have permission");
    }

    public List<TopUploaderResponse> topUploaders(User currentUser, int limit) {
        Long deptId = resolveDeptIdForSubAdmin(currentUser);
        List<UploaderCountProjection> items = resourceRepository.findTopUploaders(deptId, PageRequest.of(0, limit));
        return items.stream().map(TopUploaderResponse::fromProjection).collect(Collectors.toList());
    }

    public List<TopResourceResponse> topResources(User currentUser, String sort, int limit) {
        Long deptId = resolveDeptIdForSubAdmin(currentUser);
        List<Resource> resources;
        if ("downloads".equalsIgnoreCase(sort)) {
            resources = resourceRepository.findTopByDownloads(deptId, PageRequest.of(0, limit));
        } else if ("combined".equalsIgnoreCase(sort)) {
            resources = resourceRepository.findTopByViews(deptId, PageRequest.of(0, limit * 2)); // get broader set
            resources = new java.util.ArrayList<>(resources);
            resources.addAll(resourceRepository.findTopByDownloads(deptId, PageRequest.of(0, limit * 2)));
            resources = resources.stream()
                    .distinct()
                    .sorted(Comparator.comparingLong((Resource r) ->
                            (r.getViews() != null ? r.getViews() : 0) + (r.getDownloads() != null ? r.getDownloads() : 0))
                            .reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
        } else {
            resources = resourceRepository.findTopByViews(deptId, PageRequest.of(0, limit));
        }
        return resources.stream().map(TopResourceResponse::fromResource).collect(Collectors.toList());
    }

    public List<ResourceResponse> recentUploads(User currentUser, int limit) {
        Long deptId = resolveDeptIdForSubAdmin(currentUser);
        return resourceRepository.findRecentUploads(deptId, PageRequest.of(0, limit)).stream()
                .map(ResourceResponse::fromResource)
                .collect(Collectors.toList());
    }

    public Long storageUsage(User currentUser) {
        if (currentUser == null || !UserType.ADMIN.equals(currentUser.getType())) {
            throw new ForbiddenException("Only ADMIN can view storage usage");
        }
        Long total = resourceRepository.sumAllSizeBytes();
        return total != null ? total : 0L;
    }
}
