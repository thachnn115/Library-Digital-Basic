package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.ClassroomRequest;
import be.library_digital.demo.dto.response.ClassroomResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Classroom;
import be.library_digital.demo.model.Cohort;
import be.library_digital.demo.model.Department;
import be.library_digital.demo.model.Specialization;
import be.library_digital.demo.repository.ClassroomRepository;
import be.library_digital.demo.repository.CohortRepository;
import be.library_digital.demo.repository.DepartmentRepository;
import be.library_digital.demo.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CLASSROOM-SERVICE")
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final SpecializationRepository specializationRepository;
    private final CohortRepository cohortRepository;

    public ClassroomResponse create(ClassroomRequest request) {
        String code = request.getCode().trim();
        if (classroomRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Classroom code already exists");
        }

        Specialization specialization = specializationRepository.findByCodeIgnoreCase(request.getSpecializationCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));

        Cohort cohort = cohortRepository.findByCodeIgnoreCase(request.getCohortCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));

        Classroom classroom = Classroom.builder()
                .code(code)
                .name(request.getName().trim())
                .description(request.getDescription())
                .specialization(specialization)
                .cohort(cohort)
                .build();

        Classroom saved = classroomRepository.save(classroom);
        log.info("Created classroom id={}", saved.getId());
        return ClassroomResponse.fromClassroom(saved);
    }

    public ClassroomResponse update(String id, ClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        String code = request.getCode().trim();
        if (classroomRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Classroom code already exists");
        }

        Specialization specialization = specializationRepository.findByCodeIgnoreCase(request.getSpecializationCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));

        Cohort cohort = cohortRepository.findByCodeIgnoreCase(request.getCohortCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));

        classroom.setCode(code);
        classroom.setName(request.getName().trim());
        classroom.setDescription(request.getDescription());
        classroom.setSpecialization(specialization);
        classroom.setCohort(cohort);

        Classroom saved = classroomRepository.save(classroom);
        log.info("Updated classroom id={}", saved.getId());
        return ClassroomResponse.fromClassroom(saved);
    }

    public ClassroomResponse getById(String id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        return ClassroomResponse.fromClassroom(classroom);
    }

    public List<ClassroomResponse> getAll(String code, String specializationCode, String cohortCode) {
        String codeFilter = code != null ? code.trim().toLowerCase() : "";
        String specFilter = specializationCode != null ? specializationCode.trim().toLowerCase() : "";
        String cohortFilter = cohortCode != null ? cohortCode.trim().toLowerCase() : "";

        return classroomRepository.findAll().stream()
                .filter(c -> codeFilter.isEmpty() || (c.getCode() != null && c.getCode().toLowerCase().contains(codeFilter)))
                .filter(c -> specFilter.isEmpty() || (c.getSpecialization() != null && c.getSpecialization().getCode() != null
                        && c.getSpecialization().getCode().toLowerCase().equals(specFilter)))
                .filter(c -> cohortFilter.isEmpty() || (c.getCohort() != null && c.getCohort().getCode() != null
                        && c.getCohort().getCode().toLowerCase().equals(cohortFilter)))
                .map(ClassroomResponse::fromClassroom)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        classroomRepository.delete(classroom);
        log.info("Deleted classroom id={}", id);
    }
}
