package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.TrainingProgramRequest;
import be.library_digital.demo.dto.response.TrainingProgramResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.TrainingProgram;
import be.library_digital.demo.repository.TrainingProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "TRAINING-PROGRAM-SERVICE")
public class TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;

    public TrainingProgramResponse create(TrainingProgramRequest request) {
        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (trainingProgramRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Program code already exists");
        }
        if (trainingProgramRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Program name already exists");
        }

        TrainingProgram program = TrainingProgram.builder()
                .code(code)
                .name(name)
                .description(request.getDescription())
                .build();

        TrainingProgram saved = trainingProgramRepository.save(program);
        log.info("Created training program id={}", saved.getId());
        return TrainingProgramResponse.fromProgram(saved);
    }

    public TrainingProgramResponse update(String id, TrainingProgramRequest request) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));

        String code = request.getCode().trim();
        String name = request.getName().trim();

        if (trainingProgramRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Program code already exists");
        }
        if (trainingProgramRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Program name already exists");
        }

        program.setCode(code);
        program.setName(name);
        program.setDescription(request.getDescription());

        TrainingProgram saved = trainingProgramRepository.save(program);
        log.info("Updated training program id={}", saved.getId());
        return TrainingProgramResponse.fromProgram(saved);
    }

    public TrainingProgramResponse getById(String id) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));
        return TrainingProgramResponse.fromProgram(program);
    }

    public List<TrainingProgramResponse> getAll(String code, String name) {
        String codeFilter = code != null ? code.trim() : "";
        String nameFilter = name != null ? name.trim() : "";

        List<TrainingProgram> programs;
        if (codeFilter.isEmpty() && nameFilter.isEmpty()) {
            programs = trainingProgramRepository.findAll();
        } else if (!codeFilter.isEmpty() && nameFilter.isEmpty()) {
            programs = trainingProgramRepository.findByCodeContainingIgnoreCase(codeFilter);
        } else if (codeFilter.isEmpty()) {
            programs = trainingProgramRepository.findByNameContainingIgnoreCase(nameFilter);
        } else {
            programs = trainingProgramRepository.findByCodeContainingIgnoreCaseAndNameContainingIgnoreCase(codeFilter, nameFilter);
        }

        return programs.stream()
                .map(TrainingProgramResponse::fromProgram)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        TrainingProgram program = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));
        trainingProgramRepository.delete(program);
        log.info("Deleted training program id={}", id);
    }
}
