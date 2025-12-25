package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class CourseRequest implements Serializable {

    @NotBlank(message = "title must be not blank")
    private String title;

    private String description;

    @NotBlank(message = "classroomId must not be blank")
    private String classroomId;

    private String instructorId;
}
