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
    private String title;
    private String description;
    private ClassroomResponse classroom;
    private PublicUser instructor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseResponse fromCourse(Course course) {
        if (course == null) return null;

        ClassroomResponse classroom = ClassroomResponse.fromClassroom(course.getClassroom());
        PublicUser instr = PublicUser.fromUser(course.getInstructor());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .classroom(classroom)
                .instructor(instr)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
