package br.com.dinacare.repository.user;

import br.com.dinacare.domain.user.User;
import br.com.dinacare.domain.user.UserRole;
import br.com.dinacare.domain.user.WorkDays;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByLogin(String login);
    boolean existsByLogin(String login);
    List<User> findByActiveTrue();
    List<User> findByUserRole(UserRole userRole);
    List<User> findByActiveTrueAndUserRole(UserRole userRole);
    List<User> findByWorkDaysContaining(WorkDays workDay);
}
