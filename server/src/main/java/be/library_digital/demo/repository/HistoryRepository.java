package be.library_digital.demo.repository;

import be.library_digital.demo.model.History;
import be.library_digital.demo.common.HistoryAction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findByUser_IdAndActionOrderByCreatedAtDesc(String userId, HistoryAction action);

    void deleteByResource_Id(String resourceId);

    long countByResource_IdAndAction(String resourceId, HistoryAction action);
}
