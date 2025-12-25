package be.library_digital.demo.dto.response;

import be.library_digital.demo.repository.projection.UploaderCountProjection;
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
public class TopUploaderResponse {
    private String userId;
    private String email;
    private String fullName;
    private Long departmentId;
    private String departmentName;
    private Long uploadCount;

    public static TopUploaderResponse fromProjection(UploaderCountProjection p) {
        if (p == null) return null;
        return TopUploaderResponse.builder()
                .userId(p.getUserId())
                .email(p.getEmail())
                .fullName(p.getFullName())
                .departmentId(p.getDepartmentId())
                .departmentName(p.getDepartmentName())
                .uploadCount(p.getUploadCount())
                .build();
    }
}
