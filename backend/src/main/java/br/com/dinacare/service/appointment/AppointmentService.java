package br.com.dinacare.service.appointment;

import br.com.dinacare.domain.appointment.*;
import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.user.User;
import br.com.dinacare.repository.appointment.AppointmentRepository;
import br.com.dinacare.repository.client.ClientRepository;
import br.com.dinacare.repository.procedure.ProcedureRepository;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProcedureRepository procedureRepository;

    public AppointmentResponse create(AppointmentRequest request) {
        User user           = userRepository.findById(request.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Client client       = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        Procedure procedure = procedureRepository.findById(request.procedureId())
                .orElseThrow(() -> new EntityNotFoundException("Procedure not found"));

        validateSchedule(user, request, procedure);

        Appointment appointment = AppointmentMapper.toEntity(request, user, client, procedure);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> findByUserAndDate(UUID userId, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return appointmentRepository
                .findByUserAndStartTimeBetween(user, date.atStartOfDay(), date.atTime(LocalTime.MAX))
                .stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    public List<AppointmentResponse> findByClient(UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        return appointmentRepository.findByClient(client)
                .stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    public AppointmentResponse updateStatus(UUID id, AppointmentStatus status) {
        Appointment appointment = getById(id);
        appointment.setAppointmentStatus(status);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse updatePayment(UUID id, PaymentStatus status) {
        Appointment appointment = getById(id);
        appointment.setPaymentStatus(status);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public void cancel(UUID id) {
        Appointment appointment = getById(id);
        appointment.setAppointmentStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);
    }

    private void validateSchedule(User user, AppointmentRequest request, Procedure procedure) {
        LocalDateTime start = request.startTime();
        LocalDateTime end   = start.plusMinutes(procedure.getDuration());

        boolean conflict = appointmentRepository
                .findByUserAndStartTimeBetween(user, start, end)
                .stream()
                .anyMatch(a -> !a.getAppointmentStatus().equals(AppointmentStatus.CANCELED));

        if (conflict) {
            throw new IllegalStateException("User already has an appointment in this time slot");
        }
    }

    private Appointment getById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
    }
}