package be.library_digital.demo.dto.response;

import be.library_digital.demo.model.Rating;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RatingResponse {
    private Long id;
    private Integer rating;
    private PublicUser rater;
    private String resourceId;
    private LocalDateTime createdAt;

    public static RatingResponse fromRating(Rating rating) {
        if (rating == null) {
            return null;
        }

        return RatingResponse.builder()
                .id(rating.getId())
                .rating(rating.getRate())
                .rater(PublicUser.fromUser(rating.getRater()))
                .resourceId(rating.getResource() != null ? rating.getResource().getId() : null)
                .createdAt(rating.getCreatedAt())
                .build();
    }
}
