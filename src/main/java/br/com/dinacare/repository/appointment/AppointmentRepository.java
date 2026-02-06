package br.com.dinacare.repository.appointment;

import br.com.dinacare.domain.appointment.Appointment;
import br.com.dinacare.domain.appointment.AppointmentStatus;
import br.com.dinacare.domain.appointment.PaymentStatus;
import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByUserAndDate(User user, LocalDate date);
    List<Appointment> findByClient(Client client);
    List<Appointment> findByPaymentStatus(PaymentStatus paymentStatus);
    List<Appointment> findByAppointmentStatus(AppointmentStatus appointmentStatus);
    List<Appointment> findByDateBetween(LocalDate start, LocalDate end);
}
