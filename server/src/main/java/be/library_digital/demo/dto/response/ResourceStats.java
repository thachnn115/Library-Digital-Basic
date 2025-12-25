package be.library_digital.demo.dto.response;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceStats implements Serializable{
    
    private Long views;
    private Long downloads;
    private List<CommentResponse> comments;
    private Integer ratingCount;
    private Double ratingAverage;
}
