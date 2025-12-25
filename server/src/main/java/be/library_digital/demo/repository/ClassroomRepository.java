package be.library_digital.demo.repository;

import be.library_digital.demo.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, String> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    List<Classroom> findBySpecialization_CodeIgnoreCase(String specializationCode);

    List<Classroom> findByCohort_CodeIgnoreCase(String cohortCode);
}
