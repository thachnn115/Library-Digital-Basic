package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.SpecializationRequest;
import be.library_digital.demo.dto.response.SpecializationResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.Specialization;
import be.library_digital.demo.model.User;
import be.library_digital.demo.model.TrainingProgram;
import be.library_digital.demo.repository.SpecializationRepository;
import be.library_digital.demo.repository.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "SPECIALIZATION-SERVICE")
public class SpecializationService {

    private final SpecializationRepository specializationRepository;
    private final TrainingProgramRepository trainingProgramRepository;

    public SpecializationResponse create(SpecializationRequest request) {
        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (specializationRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Specialization code already exists");
        }
        if (specializationRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Specialization name already exists");
        }

        Set<TrainingProgram> programs = resolvePrograms(request.getProgramCodes());

        Specialization specialization = Specialization.builder()
                .code(code)
                .name(name)
                .description(request.getDescription())
                .programs(programs)
                .build();

        Specialization saved = specializationRepository.save(specialization);
        log.info("Created specialization id={}", saved.getId());
        return SpecializationResponse.fromSpecialization(saved);
    }

    public SpecializationResponse update(String id, SpecializationRequest request) {
        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));

        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (specializationRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Specialization code already exists");
        }
        if (specializationRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Specialization name already exists");
        }

        Set<TrainingProgram> programs = resolvePrograms(request.getProgramCodes());

        specialization.setCode(code);
        specialization.setName(name);
        specialization.setDescription(request.getDescription());
        specialization.setPrograms(programs);

        Specialization saved = specializationRepository.save(specialization);
        log.info("Updated specialization id={}", saved.getId());
        return SpecializationResponse.fromSpecialization(saved);
    }

    public SpecializationResponse getById(String id, User currentUser) {
        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
        enforceViewPermission(currentUser, specialization);
        return SpecializationResponse.fromSpecialization(specialization);
    }

    public List<SpecializationResponse> getAll(User currentUser, String programId, String programCode, String code, String name) {
        String programIdFilter = programId != null ? programId.trim() : "";
        String programCodeFilter = programCode != null ? programCode.trim().toLowerCase() : "";
        String codeFilter = code != null ? code.trim().toLowerCase() : "";
        String nameFilter = name != null ? name.trim().toLowerCase() : "";

        List<Specialization> list = specializationRepository.findAll();

        return list.stream()
                .filter(sp -> canView(currentUser, sp))
                .filter(sp -> programIdFilter.isEmpty() || hasProgramId(sp, programIdFilter))
                .filter(sp -> programCodeFilter.isEmpty() || hasProgramCode(sp, programCodeFilter))
                .filter(sp -> codeFilter.isEmpty() || (sp.getCode() != null && sp.getCode().toLowerCase().contains(codeFilter)))
                .filter(sp -> nameFilter.isEmpty() || (sp.getName() != null && sp.getName().toLowerCase().contains(nameFilter)))
                .map(SpecializationResponse::fromSpecialization)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
        specializationRepository.delete(specialization);
        log.info("Deleted specialization id={}", id);
    }

    private void enforceViewPermission(User user, Specialization sp) {
        if (user == null || user.getType() == null) {
            throw new ForbiddenException("You don't have permission to view this specialization");
        }
        if (UserType.ADMIN.equals(user.getType())) {
            return;
        }
        if (UserType.SUB_ADMIN.equals(user.getType()) || UserType.LECTURER.equals(user.getType())) {
            return;
        }
        throw new ForbiddenException("You don't have permission to view this specialization");
    }

    private boolean canView(User user, Specialization sp) {
        try {
            enforceViewPermission(user, sp);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Set<TrainingProgram> resolvePrograms(List<String> programCodes) {
        if (programCodes == null || programCodes.isEmpty()) {
            throw new BadRequestException("programCodes must not be empty");
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String code : programCodes) {
            if (code == null || code.isBlank()) {
                continue;
            }
            normalized.add(code.trim());
        }
        if (normalized.isEmpty()) {
            throw new BadRequestException("programCodes must not be empty");
        }

        Set<TrainingProgram> programs = new LinkedHashSet<>();
        for (String code : normalized) {
            TrainingProgram program = trainingProgramRepository.findByCodeIgnoreCase(code)
                    .orElseThrow(() -> new ResourceNotFoundException("Training program not found: " + code));
            programs.add(program);
        }
        return programs;
    }

    private boolean hasProgramId(Specialization specialization, String programId) {
        if (specialization == null || specialization.getPrograms() == null) {
            return false;
        }
        return specialization.getPrograms().stream()
                .anyMatch(program -> program != null && programId.equals(program.getId()));
    }

    private boolean hasProgramCode(Specialization specialization, String programCode) {
        if (specialization == null || specialization.getPrograms() == null) {
            return false;
        }
        return specialization.getPrograms().stream()
                .anyMatch(program -> program != null
                        && program.getCode() != null
                        && program.getCode().equalsIgnoreCase(programCode));
    }
}
