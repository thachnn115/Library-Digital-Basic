package be.library_digital.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.core.io.FileSystemResource;

@Data
@Builder
public class ResourceDownloadResponse {
    private FileSystemResource file;
    private String filename;
    private String contentType;
}
