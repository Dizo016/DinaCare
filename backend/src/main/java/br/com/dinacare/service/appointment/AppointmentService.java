package br.com.dinacare.service.appointment;

import br.com.dinacare.domain.appointment.*;
import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.user.User;
import br.com.dinacare.domain.user.WorkDays;
import br.com.dinacare.repository.appointment.AppointmentRepository;
import br.com.dinacare.repository.client.ClientRepository;
import br.com.dinacare.repository.procedure.ProcedureRepository;
import br.com.dinacare.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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

        validateSchedule(user, request.startTime(), procedure);

        Appointment appointment = AppointmentMapper.toEntity(request, user, client, procedure);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse createPublic(PublicAppointmentRequest request) {
        User user = userRepository.findById(request.profissionalId())
                .orElseThrow(() -> new EntityNotFoundException("Profissional not found"));

        Procedure procedure = procedureRepository.findById(request.procedureId())
                .orElseThrow(() -> new EntityNotFoundException("Procedure not found"));

        // Busca cliente pelo telefone ou cria um novo
        Client client = clientRepository.findByPhone(request.clientPhone())
                .orElseGet(() -> clientRepository.save(
                        Client.builder()
                                .name(request.clientName())
                                .phone(request.clientPhone())
                                .build()
                ));

        validateSchedule(user, request.startTime(), procedure);

        Appointment appointment = Appointment.builder()
                .user(user)
                .client(client)
                .procedure(procedure)
                .duration(procedure.getDuration())
                .startTime(request.startTime())
                .endTime(request.startTime().plusMinutes(procedure.getDuration()))
                .chargedPrice(procedure.getPrice())
                .appointmentStatus(AppointmentStatus.SCHEDULED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public List<LocalTime> getAvailableSlots(UUID userId, LocalDate date) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Verifica se a profissional trabalha nesse dia da semana
        WorkDays workDay = toWorkDay(date.getDayOfWeek());
        if (!user.getWorkDays().contains(workDay)) {
            return List.of();
        }

        // Busca agendamentos já existentes no dia
        List<Appointment> existing = appointmentRepository
                .findByUserAndStartTimeBetween(user, date.atStartOfDay(), date.atTime(LocalTime.MAX));

        // Gera todos os slots de 30 em 30 minutos dentro do horário de trabalho
        List<LocalTime> slots = new ArrayList<>();
        LocalTime cursor = user.getEntryTime();
        LocalTime end    = user.getExitTime();

        while (!cursor.isAfter(end.minusMinutes(30))) {
            // Pula horário de almoço
            if (user.getLunchStartTime() != null && user.getLunchEndTime() != null) {
                if (!cursor.isBefore(user.getLunchStartTime()) && cursor.isBefore(user.getLunchEndTime())) {
                    cursor = cursor.plusMinutes(30);
                    continue;
                }
            }

            // Verifica se algum agendamento existente ocupa esse slot
            LocalDateTime slotStart = date.atTime(cursor);
            LocalDateTime slotEnd   = slotStart.plusMinutes(30);

            boolean ocupado = existing.stream()
                    .filter(a -> a.getAppointmentStatus() != AppointmentStatus.CANCELED)
                    .anyMatch(a -> a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart));

            if (!ocupado) {
                slots.add(cursor);
            }

            cursor = cursor.plusMinutes(30);
        }

        return slots;
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

    private void validateSchedule(User user, LocalDateTime startTime, Procedure procedure) {
        LocalDateTime end = startTime.plusMinutes(procedure.getDuration());

        boolean conflict = !appointmentRepository
                .findConflictingAppointments(user, startTime, end)
                .isEmpty();

        if (conflict) {
            throw new IllegalStateException("User already has an appointment in this time slot");
        }
    }

    private WorkDays toWorkDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY    -> WorkDays.MONDAY;
            case TUESDAY   -> WorkDays.TUESDAY;
            case WEDNESDAY -> WorkDays.WEDNESDAY;
            case THURSDAY  -> WorkDays.THURSDAY;
            case FRIDAY    -> WorkDays.FRIDAY;
            case SATURDAY  -> WorkDays.SATURDAY;
            case SUNDAY    -> WorkDays.SUNDAY;
        };
    }

    private Appointment getById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
    }
}