package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Classroom;
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
public class ClassroomResponse implements Serializable {
    private String id;
    private String code;
    private String name;
    private String description;
    private SpecializationResponse specialization;
    private CohortResponse cohort;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClassroomResponse fromClassroom(Classroom classroom) {
        if (classroom == null) return null;

        return ClassroomResponse.builder()
                .id(classroom.getId())
                .code(classroom.getCode())
                .name(classroom.getName())
                .description(classroom.getDescription())
                .specialization(SpecializationResponse.fromSpecialization(classroom.getSpecialization()))
                .cohort(CohortResponse.fromCohort(classroom.getCohort()))
                .createdAt(classroom.getCreatedAt())
                .updatedAt(classroom.getUpdatedAt())
                .build();
    }
}
