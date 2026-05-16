package br.com.dinacare.repository.client;

import br.com.dinacare.domain.client.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findByNameContainingIgnoreCase(String name);
    List<Client> findByActiveTrue();
    Optional<Client> findByPhone(String phone);
}