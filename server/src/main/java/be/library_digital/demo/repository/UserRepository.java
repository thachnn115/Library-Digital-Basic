package be.library_digital.demo.repository;

import be.library_digital.demo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    @Query(value = "SELECT u FROM User u WHERE u.status='ACTIVE' " +
            "AND LOWER(u.email) = :username")
    Optional<User> loadUserByUsername(String username);

    @Query(value = "SELECT u FROM User u WHERE u.status='ACTIVE' " +
            "AND (LOWER(u.fullName) LIKE :keyword " +
            "OR LOWER(u.phone) LIKE :keyword " +
            "OR LOWER(u.email) LIKE :keyword)")
    Page<User> searchByKeyword(String keyword, Pageable pageable);

    Page<User> findByDepartment_Id(Long departmentId, Pageable pageable);
}
