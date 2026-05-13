package br.com.dinacare.service.user;

import br.com.dinacare.domain.user.User;
import br.com.dinacare.domain.user.UserMapper;
import br.com.dinacare.domain.user.UserRequest;
import br.com.dinacare.domain.user.UserResponse;
import br.com.dinacare.domain.user.UserRole;
import br.com.dinacare.domain.user.WorkDays;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse create(UserRequest request) {
        if (repository.existsByLogin(request.login())) {
            throw new IllegalArgumentException("Login already in use");
        }
        String encodedPassword = passwordEncoder.encode(request.password());
        return UserMapper.toResponse(repository.save(UserMapper.toEntity(request, encodedPassword)));
    }

    public List<UserResponse> findAll() {
        return repository.findByActiveTrue()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public UserResponse findById(UUID id) {
        return UserMapper.toResponse(getById(id));
    }

    public List<UserResponse> findByRole(UserRole role) {
        return repository.findByActiveTrueAndUserRole(role)
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public List<UserResponse> findByWorkDay(WorkDays workDay) {
        return repository.findByWorkDaysContaining(workDay)
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public UserResponse update(UUID id, UserRequest request) {
        User existing = getById(id);
        existing.setName(request.name());
        existing.setLogin(request.login());
        existing.setUserRole(request.userRole());
        existing.setEntryTime(request.entryTime());
        existing.setExitTime(request.exitTime());
        existing.setLunchStartTime(request.lunchStartTime());
        existing.setLunchEndTime(request.lunchEndTime());
        existing.setWorkDays(request.workDays());
        return UserMapper.toResponse(repository.save(existing));
    }

    public void deactivate(UUID id) {
        User user = getById(id);
        user.setActive(false);
        repository.save(user);
    }

    private User getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}