package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Cohort;
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
public class CohortResponse implements Serializable {
    private String id;
    private String code;
    private String description;
    private TrainingProgramResponse program;
    private Integer startYear;
    private Integer endYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CohortResponse fromCohort(Cohort cohort) {
        if (cohort == null) return null;

        return CohortResponse.builder()
                .id(cohort.getId())
                .code(cohort.getCode())
                .description(cohort.getDescription())
                .program(TrainingProgramResponse.fromProgram(cohort.getProgram()))
                .startYear(cohort.getStartYear())
                .endYear(cohort.getEndYear())
                .createdAt(cohort.getCreatedAt())
                .updatedAt(cohort.getUpdatedAt())
                .build();
    }
}
