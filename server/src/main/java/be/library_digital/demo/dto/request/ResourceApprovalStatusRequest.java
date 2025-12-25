package be.library_digital.demo.dto.request;

import be.library_digital.demo.common.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceApprovalStatusRequest {
    @NotNull(message = "status phải được cung cấp")
    private ApprovalStatus status;
}
