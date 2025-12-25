package be.library_digital.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderNodeResponse {
    private String type; // PROGRAM, SPECIALIZATION, COURSE, LECTURER, CLASSROOM, RESOURCE
    private String id;
    private String code;
    private String name;
    private String extra;
}
