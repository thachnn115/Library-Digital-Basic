package be.library_digital.demo.repository;

import be.library_digital.demo.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    boolean existsByClassroom_Specialization_IdAndTitleIgnoreCase(String specializationId, String title);

    boolean existsByClassroom_Specialization_IdAndTitleIgnoreCaseAndIdNot(String specializationId, String title, String id);
}
