package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.DepartmentRequest;
import be.library_digital.demo.dto.response.DepartmentResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Department;
import be.library_digital.demo.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "DEPARTMENT-SERVICE")
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private static final String MESSAGE_NOT_FOUND = "Department not found";


    public DepartmentResponse create(DepartmentRequest request) {

        String code = request.getCode().trim();
        String name = request.getName().trim();

        if(departmentRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Department code already existed");
        }

        if(departmentRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Department name already existed");
        }

        Department dept = Department.builder()
                .code(code)
                .name(name)
                .description(request.getDescription())
                .build();

        Department saved = departmentRepository.save(dept);
        log.info("Created department id={}", saved.getId());
        return DepartmentResponse.fromDepartment(saved);
    }

    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        String code = request.getCode().trim();
        String name = request.getName().trim();

        if(departmentRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Department code already existed");
        }

        if(departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Department name already existed");
        }

        dept.setCode(code);
        dept.setName(name);
        dept.setDescription(request.getDescription());

        Department saved = departmentRepository.save(dept);
        log.info("Updated department id={}", saved.getId());
        return DepartmentResponse.fromDepartment(saved);
    }

    public DepartmentResponse getById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        return DepartmentResponse.fromDepartment(dept);
    }

    public List<DepartmentResponse> getAll(String code, String name) {
        String codeFilter = code != null ? code.trim() : "";
        String nameFilter = name != null ? name.trim() : "";

        List<Department> departments;
        if (codeFilter.isEmpty() && nameFilter.isEmpty()) {
            departments = departmentRepository.findAll();
        } else if (!codeFilter.isEmpty() && nameFilter.isEmpty()) {
            departments = departmentRepository.findByCodeContainingIgnoreCase(codeFilter);
        } else if (codeFilter.isEmpty()) { // only name
            departments = departmentRepository.findByNameContainingIgnoreCase(nameFilter);
        } else { // both code & name provided -> match both
            departments = departmentRepository.findByCodeContainingIgnoreCaseAndNameContainingIgnoreCase(codeFilter, nameFilter);
        }

        return departments.stream()
                .map(DepartmentResponse::fromDepartment)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        departmentRepository.delete(dept);
        log.info("Deleted department id={}", id);
    }
}
