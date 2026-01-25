package be.library_digital.demo.repository;

import be.library_digital.demo.model.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, String> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

    List<Specialization> findByPrograms_Id(String programId);

    List<Specialization> findByPrograms_CodeIgnoreCase(String programCode);

    java.util.Optional<Specialization> findByCodeIgnoreCase(String code);
}
