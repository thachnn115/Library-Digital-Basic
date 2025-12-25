package be.library_digital.demo.service;

import be.library_digital.demo.common.HistoryAction;
import be.library_digital.demo.dto.response.HistoryResponse;
import be.library_digital.demo.model.History;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.HistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "HISTORY-SERVICE")
public class HistoryService {

    private final HistoryRepository historyRepository;

    public List<HistoryResponse> getViewHistory(User currentUser) {
        return getHistoryByAction(currentUser, HistoryAction.VIEW);
    }

    public List<HistoryResponse> getDownloadHistory(User currentUser) {
        return getHistoryByAction(currentUser, HistoryAction.DOWNLOAD);
    }

    private List<HistoryResponse> getHistoryByAction(User currentUser, HistoryAction action) {
        List<History> items = historyRepository.findByUser_IdAndActionOrderByCreatedAtDesc(currentUser.getId(), action);
        log.info("Fetched {} history items for user={} action={}", items.size(), currentUser.getId(), action);
        return items.stream()
                .map(HistoryResponse::fromHistory)
                .collect(Collectors.toList());
    }
}
