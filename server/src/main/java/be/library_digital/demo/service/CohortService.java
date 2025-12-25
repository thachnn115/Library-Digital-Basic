package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.CohortRequest;
import be.library_digital.demo.dto.response.CohortResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Cohort;
import be.library_digital.demo.model.TrainingProgram;
import be.library_digital.demo.repository.CohortRepository;
import be.library_digital.demo.repository.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "COHORT-SERVICE")
public class CohortService {

    private final CohortRepository cohortRepository;
    private final TrainingProgramRepository trainingProgramRepository;

    public CohortResponse create(CohortRequest request) {
        String code = request.getCode().trim();
        if (cohortRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Cohort code already exists");
        }

        TrainingProgram program = trainingProgramRepository.findByCodeIgnoreCase(request.getProgramCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));

        validateYears(request.getStartYear(), request.getEndYear());

        Cohort cohort = Cohort.builder()
                .code(code)
                .description(request.getDescription())
                .program(program)
                .startYear(request.getStartYear())
                .endYear(request.getEndYear())
                .build();

        Cohort saved = cohortRepository.save(cohort);
        log.info("Created cohort id={}", saved.getId());
        return CohortResponse.fromCohort(saved);
    }

    public CohortResponse update(String id, CohortRequest request) {
        Cohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));

        String code = request.getCode().trim();
        if (cohortRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Cohort code already exists");
        }

        TrainingProgram program = trainingProgramRepository.findByCodeIgnoreCase(request.getProgramCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));

        validateYears(request.getStartYear(), request.getEndYear());

        cohort.setCode(code);
        cohort.setDescription(request.getDescription());
        cohort.setProgram(program);
        cohort.setStartYear(request.getStartYear());
        cohort.setEndYear(request.getEndYear());

        Cohort saved = cohortRepository.save(cohort);
        log.info("Updated cohort id={}", saved.getId());
        return CohortResponse.fromCohort(saved);
    }

    public CohortResponse getById(String id) {
        Cohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));
        return CohortResponse.fromCohort(cohort);
    }

    public List<CohortResponse> getAll(String code, String programCode, Integer startYear, Integer endYear) {
        String codeFilter = code != null ? code.trim().toLowerCase() : "";
        String programCodeFilter = programCode != null ? programCode.trim().toLowerCase() : "";

        return cohortRepository.findAll().stream()
                .filter(c -> codeFilter.isEmpty() || (c.getCode() != null && c.getCode().toLowerCase().contains(codeFilter)))
                .filter(c -> programCodeFilter.isEmpty() || (c.getProgram() != null && c.getProgram().getCode() != null
                        && c.getProgram().getCode().toLowerCase().equals(programCodeFilter)))
                .filter(c -> startYear == null || (c.getStartYear() != null && c.getStartYear() >= startYear))
                .filter(c -> endYear == null || (c.getEndYear() != null && c.getEndYear() <= endYear))
                .map(CohortResponse::fromCohort)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        Cohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found"));
        cohortRepository.delete(cohort);
        log.info("Deleted cohort id={}", id);
    }

    private void validateYears(Integer startYear, Integer endYear) {
        if (startYear == null || endYear == null) {
            throw new BadRequestException("startYear and endYear are required");
        }
        if (startYear > endYear) {
            throw new BadRequestException("startYear must not be greater than endYear");
        }
    }
}
