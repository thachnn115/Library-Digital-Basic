package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class ResourceTypeRequest implements Serializable {

    @NotBlank(message = "code must not be blank")
    private String code;

    @NotBlank(message = "name must not be blank")
    private String name;

    private String description;
}
