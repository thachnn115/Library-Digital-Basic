package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Resource;
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
public class TopResourceResponse {
    private ResourceResponse resource;
    private Long views;
    private Long downloads;
    private Long score; // e.g., combined metric if needed

    public static TopResourceResponse fromResource(Resource resource) {
        if (resource == null) return null;
        long views = resource.getViews() != null ? resource.getViews().longValue() : 0L;
        long downloads = resource.getDownloads() != null ? resource.getDownloads().longValue() : 0L;
        return TopResourceResponse.builder()
                .resource(ResourceResponse.fromResource(resource))
                .views(views)
                .downloads(downloads)
                .score(views + downloads)
                .build();
    }
}
