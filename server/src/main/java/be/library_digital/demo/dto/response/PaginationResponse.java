package be.library_digital.demo.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaginationResponse implements Serializable {
    private Integer pageNumber;
    private Integer size;
    private Integer totalPages;
    private Long totalElements;
}
