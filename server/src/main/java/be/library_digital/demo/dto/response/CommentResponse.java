package be.library_digital.demo.dto.response;

import java.time.LocalDateTime;

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
public class CommentResponse {
    private String id;
    private String content;
    private String resourceId;
    private PublicUser author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse fromComment(be.library_digital.demo.model.Comment comment) {
        if (comment == null) return null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .resourceId(comment.getResource() != null ? comment.getResource().getId() : null)
                .author(PublicUser.fromUser(comment.getAuthor()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
