package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Specialization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SpecializationResponse implements Serializable {
    private String id;
    private String code;
    private String name;
    private String description;
    private DepartmentResponse department;
    private TrainingProgramResponse program;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SpecializationResponse fromSpecialization(Specialization specialization) {
        if (specialization == null) return null;

        return SpecializationResponse.builder()
                .id(specialization.getId())
                .code(specialization.getCode())
                .name(specialization.getName())
                .description(specialization.getDescription())
                .department(DepartmentResponse.fromDepartment(specialization.getDepartment()))
                .program(TrainingProgramResponse.fromProgram(specialization.getProgram()))
                .createdAt(specialization.getCreatedAt())
                .updatedAt(specialization.getUpdatedAt())
                .build();
    }
}
