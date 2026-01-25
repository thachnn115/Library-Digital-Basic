package be.library_digital.demo.dto.response;

import be.library_digital.demo.common.ApprovalStatus;
import be.library_digital.demo.model.Resource;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResourceResponse implements Serializable {
    private String id;
    private String title;
    private String description;
    private String courseId;
    private ResourceTypeResponse type;
    private String fileUrl;
    private Long sizeBytes;
    private java.time.LocalDateTime createdAt;
    private PublicUser uploadedBy;
    private ApprovalStatus approvalStatus;
    private ResourceStats stats;
    private String classroomId;
    private String classroomName;

    public static ResourceResponse fromResource(Resource resource) {
        if (resource == null)
            return null;

        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .courseId(resource.getCourse() != null ? resource.getCourse().getId() : null)
                .type(ResourceTypeResponse.fromEntity(resource.getType()))
                .fileUrl(resource.getFileUrl())
                .sizeBytes(resource.getSizeBytes())
                .createdAt(resource.getCreatedAt())
                .uploadedBy(PublicUser.fromUser(resource.getUploadedBy()))
                .approvalStatus(resource.getApprovalStatus())
                .classroomId(resource.getClassroom() != null ? resource.getClassroom().getId() : null)
                .classroomName(resource.getClassroom() != null ? resource.getClassroom().getName() : null)
                .build();
    }
}
