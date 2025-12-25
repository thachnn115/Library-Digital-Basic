package be.library_digital.demo.service;

import be.library_digital.demo.config.OpenRouterProperties;
import be.library_digital.demo.dto.request.AiChatRequest;
import be.library_digital.demo.dto.request.AiMessage;
import be.library_digital.demo.dto.response.AiChatResponse;
import be.library_digital.demo.exception.BadRequestException;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "OPENROUTER-SERVICE")
public class OpenRouterService {

    private static final String DEFAULT_SYSTEM_PROMPT = """
            You are a concise study assistant for the digital library. Provide clear, short answers and offer the next actionable steps when helpful.
            """;

    private final OpenRouterProperties properties;

    @Qualifier("openRouterRestClient")
    private final RestClient restClient;

    public AiChatResponse chat(AiChatRequest request) {
        validateConfiguration();

        String targetModel = StringUtils.hasText(request.getModel()) ? request.getModel() : properties.getModel();
        String systemPrompt = StringUtils.hasText(request.getSystemPrompt())
                ? request.getSystemPrompt()
                : DEFAULT_SYSTEM_PROMPT;

        List<OpenRouterMessage> messages = new ArrayList<>();
        messages.add(new OpenRouterMessage("system", systemPrompt));

        if (request.getHistory() != null) {
            request.getHistory().stream()
                    .filter(msg -> StringUtils.hasText(msg.getRole()) && StringUtils.hasText(msg.getContent()))
                    .forEach(msg -> messages.add(new OpenRouterMessage(msg.getRole().trim(), msg.getContent().trim())));
        }

        messages.add(new OpenRouterMessage("user", request.getMessage().trim()));
        OpenRouterChatRequest payload = new OpenRouterChatRequest(targetModel, messages);

        OpenRouterChatResponse response = callOpenRouter(payload);
        if (response == null) {
            throw new IllegalStateException("No response from OpenRouter");
        }
        if (response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new IllegalStateException("OpenRouter returned empty choices");
        }

        OpenRouterChoice topChoice = response.getChoices().get(0);
        String answer = topChoice.getMessage() != null ? topChoice.getMessage().content() : null;
        if (!StringUtils.hasText(answer)) {
            throw new IllegalStateException("OpenRouter returned empty answer");
        }

        return AiChatResponse.builder()
                .id(response.getId())
                .model(response.getModel())
                .answer(answer)
                .finishReason(topChoice.getFinishReason())
                .build();
    }

    private OpenRouterChatResponse callOpenRouter(OpenRouterChatRequest payload) {
        try {
            log.info("Calling OpenRouter with model: {}", payload.model());
            return restClient.post()
                    .uri("/chat/completions")
                    .body(payload)
                    .retrieve()
                    .body(OpenRouterChatResponse.class);
        } catch (RestClientResponseException e) {
            log.error("OpenRouter API error {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException("OpenRouter API error: " + e.getStatusText());
        } catch (RestClientException e) {
            log.error("Cannot reach OpenRouter", e);
            throw new IllegalStateException("Cannot connect to OpenRouter service");
        }
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(properties.getApiKey())) {
            throw new IllegalStateException("OPENROUTER_API_KEY is not configured");
        }
        if (!StringUtils.hasText(properties.getBaseUrl())) {
            throw new IllegalStateException("openrouter.base-url is not configured");
        }
        if (!StringUtils.hasText(properties.getModel())) {
            throw new IllegalStateException("openrouter.model is not configured");
        }
    }

    private record OpenRouterChatRequest(String model, List<OpenRouterMessage> messages) {
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class OpenRouterChatResponse {
        private String id;
        private String model;
        private List<OpenRouterChoice> choices;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class OpenRouterChoice {
        private OpenRouterMessage message;

        @JsonProperty("finish_reason")
        private String finishReason;
    }

    private record OpenRouterMessage(String role, String content) {
    }
}
