package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class SpecializationRequest implements Serializable {

    @NotBlank(message = "code must not be blank")
    private String code;

    @NotBlank(message = "name must not be blank")
    private String name;

    @NotBlank(message = "programCode must not be blank")
    private String programCode;

    @NotBlank(message = "departmentCode must not be blank")
    private String departmentCode;

    private String description;
}
