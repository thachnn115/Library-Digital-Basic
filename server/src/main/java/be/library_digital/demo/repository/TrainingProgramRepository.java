package be.library_digital.demo.repository;

import be.library_digital.demo.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, String> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

    java.util.Optional<TrainingProgram> findByCodeIgnoreCase(String code);

    java.util.List<TrainingProgram> findByCodeContainingIgnoreCase(String code);

    java.util.List<TrainingProgram> findByNameContainingIgnoreCase(String name);

    java.util.List<TrainingProgram> findByCodeContainingIgnoreCaseAndNameContainingIgnoreCase(String code, String name);
}
