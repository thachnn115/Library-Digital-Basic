package be.library_digital.demo.service;

import be.library_digital.demo.common.ApprovalStatus;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.dto.request.CommentRequest;
import be.library_digital.demo.dto.response.CommentResponse;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Comment;
import be.library_digital.demo.model.Resource;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.CommentRepository;
import be.library_digital.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "COMMENT-SERVICE")
public class CommentService {

    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;

    public CommentResponse create(CommentRequest request, User currentUser) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!ApprovalStatus.APPROVED.equals(resource.getApprovalStatus())) {
            throw new ForbiddenException("Cannot comment on a resource that is not approved");
        }

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setResource(resource);
        comment.setAuthor(currentUser);

        Comment saved = commentRepository.save(comment);
        log.info("Created comment id={} on resource={}", saved.getId(), resource.getId());
        return CommentResponse.fromComment(saved);
    }

    public CommentResponse update(String id, CommentRequest request, User currentUser) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        ensureOwner(comment, currentUser);
        comment.setContent(request.getContent());

        Comment saved = commentRepository.save(comment);
        log.info("Updated comment id={}", saved.getId());
        return CommentResponse.fromComment(saved);
    }

    public void delete(String id, User currentUser) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!UserType.ADMIN.equals(currentUser.getType())) {
            ensureOwner(comment, currentUser);
        }

        commentRepository.delete(comment);
        log.info("Deleted comment id={}", id);
    }

    private void ensureOwner(Comment comment, User currentUser) {
        if (comment.getAuthor() == null || currentUser == null || !comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to modify this comment");
        }
    }
}
