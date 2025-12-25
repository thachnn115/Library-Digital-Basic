package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class DepartmentRequest implements Serializable {

    @NotBlank(message = "name must be not blank")
    private String name;

    @NotBlank(message = "code must be not blank")
    private String code;

    private String description;
}
