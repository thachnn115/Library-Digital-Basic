package be.library_digital.demo.dto.response;

import java.util.List;
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
public class ResourceFolderResponse {
    private String level; // PROGRAM|SPECIALIZATION|COURSE|LECTURER|CLASSROOM|RESOURCE
    private List<FolderNodeResponse> nodes;
    private List<ResourceResponse> resources;
    private String currentUrl;
    private String nextParam; // gợi ý query param cần truyền ở cấp tiếp theo (nếu có)
    private String parentUrl; // url của cấp trước
    private List<BreadcrumbItem> breadcrumbs; // đường dẫn để back
}
