package be.library_digital.demo.dto.response;

import be.library_digital.demo.common.HistoryAction;
import be.library_digital.demo.model.History;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HistoryResponse {
    private Long id;
    private HistoryAction action;
    private ResourceResponse resource;
    private LocalDateTime createdAt;

    public static HistoryResponse fromHistory(History history) {
        if (history == null) return null;

        return HistoryResponse.builder()
                .id(history.getId())
                .action(history.getAction())
                .resource(ResourceResponse.fromResource(history.getResource()))
                .createdAt(history.getCreatedAt())
                .build();
    }
}
