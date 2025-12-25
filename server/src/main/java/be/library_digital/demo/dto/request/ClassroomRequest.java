package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class ClassroomRequest implements Serializable {

    @NotBlank(message = "code must not be blank")
    private String code;

    @NotBlank(message = "name must not be blank")
    private String name;

    @NotBlank(message = "specializationCode must not be blank")
    private String specializationCode;

    @NotBlank(message = "cohortCode must not be blank")
    private String cohortCode;

    private String description;
}
