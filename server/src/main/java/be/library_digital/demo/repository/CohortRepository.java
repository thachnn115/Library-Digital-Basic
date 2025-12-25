package be.library_digital.demo.repository;

import be.library_digital.demo.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, String> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    java.util.Optional<Cohort> findByCodeIgnoreCase(String code);
}
