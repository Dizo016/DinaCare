package br.com.dinacare.service.appointment;

import br.com.dinacare.domain.appointment.AppointmentRequest;
import br.com.dinacare.domain.appointment.AppointmentStatus;
import br.com.dinacare.domain.appointment.PaymentStatus;
import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.user.User;
import br.com.dinacare.domain.user.UserRole;
import br.com.dinacare.domain.user.WorkDays;
import br.com.dinacare.repository.client.ClientRepository;
import br.com.dinacare.repository.procedure.ProcedureRepository;
import br.com.dinacare.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AppointmentServiceTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProcedureRepository procedureRepository;

    private User savedUser;
    private Client savedClient;
    private Procedure savedProcedure;

    @BeforeEach
    void setUp() {
        savedUser = userRepository.save(User.builder()
                .name("Profissional")
                .login("prof@dina.com")
                .password("senha123")
                .userRole(UserRole.PROFESSIONAL)
                .entryTime(LocalTime.of(8, 0))
                .exitTime(LocalTime.of(18, 0))
                .workDays(Set.of(WorkDays.MONDAY, WorkDays.TUESDAY, WorkDays.WEDNESDAY,
                        WorkDays.THURSDAY, WorkDays.FRIDAY))
                .build());

        savedClient = clientRepository.save(Client.builder()
                .name("Cliente Teste")
                .phone("71999990000")
                .build());

        savedProcedure = procedureRepository.save(Procedure.builder()
                .name("Manicure")
                .duration(60)
                .price(new BigDecimal("50.00"))
                .build());
    }

    @Test
    void shouldCreateAppointment() {
        var request = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );

        var response = appointmentService.create(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.user().id()).isEqualTo(savedUser.getId());
        assertThat(response.client().id()).isEqualTo(savedClient.getId());
        assertThat(response.procedure().id()).isEqualTo(savedProcedure.getId());
        assertThat(response.appointmentStatus()).isEqualTo(AppointmentStatus.SCHEDULED);
        assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(response.startTime()).isEqualTo(LocalDateTime.of(2025, 6, 9, 9, 0));
        assertThat(response.endTime()).isEqualTo(LocalDateTime.of(2025, 6, 9, 10, 0));
    }

    @Test
    void shouldThrowWhenScheduleConflict() {
        var first = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        appointmentService.create(first);

        var conflict = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 30),
                new BigDecimal("50.00"),
                null
        );

        assertThatThrownBy(() -> appointmentService.create(conflict))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("time slot");
    }

    @Test
    void shouldAllowNonOverlappingAppointments() {
        var first = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        appointmentService.create(first);

        var second = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 10, 0),
                new BigDecimal("50.00"),
                null
        );

        assertThatNoException().isThrownBy(() -> appointmentService.create(second));
    }

    @Test
    void shouldUpdateAppointmentStatus() {
        var request = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        var created = appointmentService.create(request);

        var updated = appointmentService.updateStatus(created.id(), AppointmentStatus.CONFIRMED);

        assertThat(updated.appointmentStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    void shouldUpdatePaymentStatus() {
        var request = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        var created = appointmentService.create(request);

        var updated = appointmentService.updatePayment(created.id(), PaymentStatus.PAID);

        assertThat(updated.paymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void shouldCancelAppointment() {
        var request = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        var created = appointmentService.create(request);

        appointmentService.cancel(created.id());

        var byClient = appointmentService.findByClient(savedClient.getId());
        assertThat(byClient).hasSize(1);
        assertThat(byClient.get(0).appointmentStatus()).isEqualTo(AppointmentStatus.CANCELED);
    }

    @Test
    void shouldAllowNewAppointmentAfterCancellation() {
        var first = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        var created = appointmentService.create(first);
        appointmentService.cancel(created.id());

        var second = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );

        assertThatNoException().isThrownBy(() -> appointmentService.create(second));
    }

    @Test
    void shouldFindAppointmentsByClient() {
        var request = new AppointmentRequest(
                savedUser.getId(),
                savedClient.getId(),
                savedProcedure.getId(),
                LocalDateTime.of(2025, 6, 9, 9, 0),
                new BigDecimal("50.00"),
                null
        );
        appointmentService.create(request);

        var results = appointmentService.findByClient(savedClient.getId());

        assertThat(results).hasSize(1);
        assertThat(results.get(0).client().id()).isEqualTo(savedClient.getId());
    }
}