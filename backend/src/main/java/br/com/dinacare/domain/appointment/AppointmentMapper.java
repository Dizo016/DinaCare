package br.com.dinacare.domain.appointment;

import br.com.dinacare.domain.client.Client;
import br.com.dinacare.domain.client.ClientMapper;
import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.domain.procedure.ProcedureMapper;
import br.com.dinacare.domain.user.User;
import br.com.dinacare.domain.user.UserMapper;

import java.time.LocalDateTime;

public class AppointmentMapper {

    public static Appointment toEntity(AppointmentRequest request, User user, Client client, Procedure procedure){
        LocalDateTime endTime = request.startTime().plusMinutes(procedure.getDuration());

        return Appointment.builder()
                .user(user)
                .client(client)
                .procedure(procedure)
                .duration(procedure.getDuration())
                .startTime(request.startTime())
                .endTime(endTime)
                .chargedPrice(request.chargedPrice())
                .notes(request.notes())
                .appointmentStatus(AppointmentStatus.SCHEDULED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
    }

    public static AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                UserMapper.toResponse(appointment.getUser()),
                ClientMapper.toResponse(appointment.getClient()),
                ProcedureMapper.toResponse(appointment.getProcedure()),
                appointment.getDuration(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getAppointmentStatus(),
                appointment.getPaymentStatus(),
                appointment.getChargedPrice(),
                appointment.getNotes(),
                appointment.getCreatedAt()

        );
    }
}
