package br.com.dinacare.service.client;

import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.client.ClientMapper;
import br.com.dinacare.domain.client.ClientRequest;
import br.com.dinacare.domain.client.ClientResponse;
import br.com.dinacare.repository.client.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository repository;

    public ClientResponse create(ClientRequest request) {
        return ClientMapper.toResponse(repository.save(ClientMapper.toEntity(request)));
    }

    public List<ClientResponse> findAll() {
        return repository.findByActiveTrue()
                .stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    public ClientResponse findById(UUID id) {
        return ClientMapper.toResponse(getById(id));
    }

    public List<ClientResponse> findByName(String name) {
        return repository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    public ClientResponse update(UUID id, ClientRequest request) {
        Client existing = getById(id);
        existing.setName(request.name());
        existing.setPhone(request.phone());
        existing.setNotes(request.notes());
        return ClientMapper.toResponse(repository.save(existing));
    }

    public void deactivate(UUID id) {
        Client client = getById(id);
        client.setActive(false);
        repository.save(client);
    }

    private Client getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
    }
}