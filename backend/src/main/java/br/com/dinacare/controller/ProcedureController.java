package br.com.dinacare.controller;

import br.com.dinacare.domain.procedure.ProcedureRequest;
import br.com.dinacare.domain.procedure.ProcedureResponse;
import br.com.dinacare.service.procedure.ProcedureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/procedures")
public class ProcedureController {

    private final ProcedureService procedureService;

    @GetMapping("/public/{userId}")
    public ResponseEntity<List<ProcedureResponse>> findByProfissional(@PathVariable UUID userId) {
        return ResponseEntity.ok(procedureService.findByProfissionalId(userId));
    }

    @PostMapping
    public ResponseEntity<ProcedureResponse> create(
            @RequestBody @Valid ProcedureRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procedureService.create(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ProcedureResponse>> findAll(Principal principal) {
        return ResponseEntity.ok(procedureService.findAll(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(procedureService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcedureResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid ProcedureRequest request) {
        return ResponseEntity.ok(procedureService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        procedureService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}