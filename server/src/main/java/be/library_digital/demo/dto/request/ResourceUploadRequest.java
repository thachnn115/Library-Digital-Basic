package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceUploadRequest {
    @NotBlank(message = "title không được để trống")
    private String title;

    private String description;

    @NotBlank(message = "courseId phải được cung cấp")
    private String courseId;

    @NotBlank(message = "resourceTypeId phải được cung cấp")
    private String resourceTypeId;
}
