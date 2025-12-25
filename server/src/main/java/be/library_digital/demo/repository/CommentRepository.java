package be.library_digital.demo.repository;

import be.library_digital.demo.model.Comment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByResource_IdOrderByCreatedAtDesc(String resourceId);

    void deleteByResource_Id(String resourceId);
}
