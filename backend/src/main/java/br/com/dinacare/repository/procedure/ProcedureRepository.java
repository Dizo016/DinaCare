package br.com.dinacare.repository.procedure;

import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, UUID> {

    List<Procedure> findByUserAndActiveTrue(User user);
    List<Procedure> findByUserIdAndActiveTrue(UUID userId);
    List<Procedure> findByPriceBetween(BigDecimal min, BigDecimal max);
}