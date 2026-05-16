package br.com.dinacare.service.procedure;

import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.procedure.ProcedureMapper;
import br.com.dinacare.domain.procedure.ProcedureRequest;
import br.com.dinacare.domain.procedure.ProcedureResponse;
import br.com.dinacare.domain.user.User;
import br.com.dinacare.repository.procedure.ProcedureRepository;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ProcedureService {

    private final ProcedureRepository repository;
    private final UserRepository userRepository;

    public ProcedureResponse create(ProcedureRequest request, String login) {
        User user = getUserByLogin(login);
        return ProcedureMapper.toResponse(repository.save(ProcedureMapper.toEntity(request, user)));
    }

    public List<ProcedureResponse> findAll(String login) {
        User user = getUserByLogin(login);
        return repository.findByUserAndActiveTrue(user)
                .stream()
                .map(ProcedureMapper::toResponse)
                .toList();
    }

    public List<ProcedureResponse> findByProfissionalId(UUID userId) {
        return repository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(ProcedureMapper::toResponse)
                .toList();
    }

    public ProcedureResponse findById(UUID id) {
        return ProcedureMapper.toResponse(getById(id));
    }

    public ProcedureResponse update(UUID id, ProcedureRequest request) {
        Procedure existing = getById(id);
        existing.setName(request.name());
        existing.setDuration(request.duration());
        existing.setPrice(request.price());
        return ProcedureMapper.toResponse(repository.save(existing));
    }

    public void deactivate(UUID id) {
        Procedure procedure = getById(id);
        procedure.setActive(false);
        repository.save(procedure);
    }

    private Procedure getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure not found"));
    }

    private User getUserByLogin(String login) {
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));
    }
}