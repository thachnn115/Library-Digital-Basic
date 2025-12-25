package be.library_digital.demo.repository;

import be.library_digital.demo.model.Department;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    Optional<Department> findByName(String name);

    Optional<Department> findByCodeIgnoreCase(String code);

    List<Department> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String code, String name);

    List<Department> findByCodeContainingIgnoreCase(String code);

    List<Department> findByNameContainingIgnoreCase(String name);

    List<Department> findByCodeContainingIgnoreCaseAndNameContainingIgnoreCase(String code, String name);
}
