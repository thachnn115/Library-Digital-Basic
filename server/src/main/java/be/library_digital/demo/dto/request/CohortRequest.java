package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class CohortRequest implements Serializable {
    @NotBlank(message = "code must not be blank")
    private String code;

    @NotBlank(message = "programCode must not be blank")
    private String programCode;

    private String description;

    @jakarta.validation.constraints.NotNull(message = "startYear must not be null")
    private Integer startYear;

    @jakarta.validation.constraints.NotNull(message = "endYear must not be null")
    private Integer endYear;
}
