package br.com.dinacare.controller;

import br.com.dinacare.domain.appointment.AppointmentRequest;
import br.com.dinacare.domain.appointment.AppointmentResponse;
import br.com.dinacare.domain.appointment.AppointmentStatus;
import br.com.dinacare.domain.appointment.PaymentStatus;
import br.com.dinacare.domain.appointment.PublicAppointmentRequest;
import br.com.dinacare.service.appointment.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@RequestBody @Valid AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.create(request));
    }

    @PostMapping("/public")
    public ResponseEntity<AppointmentResponse> createPublic(@RequestBody @Valid PublicAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createPublic(request));
    }

    @GetMapping("/public/{userId}/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(userId, date));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponse>> findByUserAndDate(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.findByUserAndDate(userId, date));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AppointmentResponse>> findByClient(@PathVariable UUID clientId) {
        return ResponseEntity.ok(appointmentService.findByClient(clientId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<AppointmentResponse> updatePayment(
            @PathVariable UUID id,
            @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(appointmentService.updatePayment(id, status));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        appointmentService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}