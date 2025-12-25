package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentRequest {

    @NotBlank(message = "content không được để trống")
    private String content;

    @NotBlank(message = "resourceId không được để trống")
    private String resourceId;
}
