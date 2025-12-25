package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.ResourceTypeRequest;
import be.library_digital.demo.dto.response.ResourceTypeResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.ResourceTypeEntity;
import be.library_digital.demo.repository.ResourceTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RESOURCE-TYPE-SERVICE")
public class ResourceTypeService {

    private final ResourceTypeRepository resourceTypeRepository;

    public ResourceTypeResponse create(ResourceTypeRequest request) {
        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (resourceTypeRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Resource type code already exists");
        }
        if (resourceTypeRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Resource type name already exists");
        }

        ResourceTypeEntity entity = ResourceTypeEntity.builder()
                .code(code)
                .name(name)
                .description(request.getDescription())
                .build();

        ResourceTypeEntity saved = resourceTypeRepository.save(entity);
        log.info("Created resource type id={}", saved.getId());
        return ResourceTypeResponse.fromEntity(saved);
    }

    public ResourceTypeResponse update(String id, ResourceTypeRequest request) {
        ResourceTypeEntity entity = resourceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource type not found"));

        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (resourceTypeRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Resource type code already exists");
        }
        if (resourceTypeRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Resource type name already exists");
        }

        entity.setCode(code);
        entity.setName(name);
        entity.setDescription(request.getDescription());

        ResourceTypeEntity saved = resourceTypeRepository.save(entity);
        log.info("Updated resource type id={}", saved.getId());
        return ResourceTypeResponse.fromEntity(saved);
    }

    public ResourceTypeResponse getById(String id) {
        ResourceTypeEntity entity = resourceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource type not found"));
        return ResourceTypeResponse.fromEntity(entity);
    }

    public List<ResourceTypeResponse> getAll() {
        return resourceTypeRepository.findAll().stream()
                .map(ResourceTypeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        ResourceTypeEntity entity = resourceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource type not found"));
        resourceTypeRepository.delete(entity);
        log.info("Deleted resource type id={}", id);
    }
}
