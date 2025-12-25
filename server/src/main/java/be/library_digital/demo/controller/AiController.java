package be.library_digital.demo.controller;

import be.library_digital.demo.dto.request.AiChatRequest;
import be.library_digital.demo.dto.response.AiChatResponse;
import be.library_digital.demo.dto.response.ApiResponse;
import be.library_digital.demo.service.OpenRouterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Controller")
@Slf4j(topic = "AI-CONTROLLER")
public class AiController {

    private final OpenRouterService openRouterService;

    @PostMapping("/chat")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Chat với OpenRouter", description = "Nhận câu trả lời từ model OpenRouter dựa trên câu hỏi và history (tuỳ chọn)")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @RequestBody @Valid AiChatRequest request
    ) {
        log.info("AI chat request");
        AiChatResponse chatResponse = openRouterService.chat(request);
        ApiResponse<AiChatResponse> apiResponse = ApiResponse.<AiChatResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(chatResponse)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
