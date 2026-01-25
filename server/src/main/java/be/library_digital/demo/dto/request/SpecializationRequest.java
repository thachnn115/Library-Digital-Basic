package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.io.Serializable;
import java.util.List;

@Getter
public class SpecializationRequest implements Serializable {

    @NotBlank(message = "code must not be blank")
    private String code;

    @NotBlank(message = "name must not be blank")
    private String name;

    @NotEmpty(message = "programCodes must not be empty")
    private List<@NotBlank(message = "programCode must not be blank") String> programCodes;

    private String description;
}
