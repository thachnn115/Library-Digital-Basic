package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Specialization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private List<TrainingProgramResponse> programs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SpecializationResponse fromSpecialization(Specialization specialization) {
        if (specialization == null) return null;

        return SpecializationResponse.builder()
                .id(specialization.getId())
                .code(specialization.getCode())
                .name(specialization.getName())
                .description(specialization.getDescription())
                .programs(specialization.getPrograms() == null ? List.of()
                        : specialization.getPrograms().stream()
                        .map(TrainingProgramResponse::fromProgram)
                        .collect(Collectors.toList()))
                .createdAt(specialization.getCreatedAt())
                .updatedAt(specialization.getUpdatedAt())
                .build();
    }
}
