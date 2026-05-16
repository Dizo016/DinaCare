package br.com.dinacare.repository.appointment;

import br.com.dinacare.domain.appointment.Appointment;
import br.com.dinacare.domain.appointment.AppointmentStatus;
import br.com.dinacare.domain.appointment.PaymentStatus;
import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.user = :user
              AND a.appointmentStatus <> 'CANCELED'
              AND a.startTime < :end
              AND a.endTime > :start
            """)
    List<Appointment> findConflictingAppointments(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Appointment> findByUserAndStartTimeBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Appointment> findByUser(User user);
    List<Appointment> findByClient(Client client);
    List<Appointment> findByPaymentStatus(PaymentStatus paymentStatus);
    List<Appointment> findByAppointmentStatus(AppointmentStatus appointmentStatus);
    List<Appointment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    // Conta agendamentos futuros não cancelados — usado para notificação
    long countByUserAndAppointmentStatusNotAndStartTimeAfter(
            User user,
            AppointmentStatus status,
            LocalDateTime after
    );

    // Clientes únicos que agendaram com essa profissional
    @Query("SELECT DISTINCT a.client FROM Appointment a WHERE a.user = :user AND a.client.active = true")
    List<Client> findDistinctClientsByUser(@Param("user") User user);
}