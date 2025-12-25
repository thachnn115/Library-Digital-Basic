package be.library_digital.demo.repository;

import be.library_digital.demo.model.UserHasRole;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserHasRoleRepository extends CrudRepository<UserHasRole, Long> {
}
