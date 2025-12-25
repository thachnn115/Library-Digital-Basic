package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.TrainingProgram;
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
public class TrainingProgramResponse implements Serializable {
    private String id;
    private String code;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TrainingProgramResponse fromProgram(TrainingProgram program) {
        if (program == null) return null;

        return TrainingProgramResponse.builder()
                .id(program.getId())
                .code(program.getCode())
                .name(program.getName())
                .description(program.getDescription())
                .createdAt(program.getCreatedAt())
                .updatedAt(program.getUpdatedAt())
                .build();
    }
}
