package be.library_digital.demo.repository;

import be.library_digital.demo.model.ResourceTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceTypeRepository extends JpaRepository<ResourceTypeEntity, String> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
}
