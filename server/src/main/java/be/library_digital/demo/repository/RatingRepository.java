package be.library_digital.demo.repository;

import be.library_digital.demo.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByIdAndRater_Id(Long id, String raterId);
    List<Rating> findByResource_Id(String resourceId);
    long countByResource_Id(String resourceId);

    void deleteByResource_Id(String resourceId);
}
