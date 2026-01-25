package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class CourseRequest implements Serializable {

    @NotBlank(message = "code must be not blank")
    private String code;

    @NotBlank(message = "title must be not blank")
    private String title;

    @NotBlank(message = "departmentCode must not be blank")
    private String departmentCode;
}
