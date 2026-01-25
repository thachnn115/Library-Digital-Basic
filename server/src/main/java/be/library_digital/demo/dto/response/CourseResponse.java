package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Course;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseResponse implements Serializable {
    private String id;
    private String code;
    private String title;
    private DepartmentResponse department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseResponse fromCourse(Course course) {
        if (course == null) return null;

        DepartmentResponse dept = DepartmentResponse.fromDepartment(course.getDepartment());

        return CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .title(course.getTitle())
                .department(dept)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
