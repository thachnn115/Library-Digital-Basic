package be.library_digital.demo.service;

import be.library_digital.demo.common.ApprovalStatus;
import be.library_digital.demo.dto.request.RatingCreateRequest;
import be.library_digital.demo.dto.response.RatingResponse;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.model.Rating;
import be.library_digital.demo.model.Resource;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.RatingRepository;
import be.library_digital.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RATING-SERVICE")
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ResourceRepository resourceRepository;

    public RatingResponse create(RatingCreateRequest request, User currentUser) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!ApprovalStatus.APPROVED.equals(resource.getApprovalStatus())) {
            throw new ForbiddenException("Cannot rate a resource that is not approved");
        }

        Rating rating = new Rating();
        rating.setRate(request.getRating());
        rating.setResource(resource);
        rating.setRater(currentUser);

        Rating saved = ratingRepository.save(rating);
        log.info("Created rating id={} for resource={}", saved.getId(), resource.getId());
        return RatingResponse.fromRating(saved);
    }

    public RatingResponse update(Long id, RatingCreateRequest request, User currentUser) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

        ensureOwner(rating, currentUser);
        rating.setRate(request.getRating());

        Rating saved = ratingRepository.save(rating);
        log.info("Updated rating id={}", saved.getId());
        return RatingResponse.fromRating(saved);
    }

    public void delete(Long id, User currentUser) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

        ensureOwner(rating, currentUser);
        ratingRepository.delete(rating);
        log.info("Deleted rating id={}", id);
    }

    private void ensureOwner(Rating rating, User currentUser) {
        if (rating.getRater() == null || currentUser == null || !rating.getRater().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to modify this rating");
        }
    }
}
