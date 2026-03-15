package com.vanvan.controller;

import com.vanvan.dto.*;
import com.vanvan.enums.TripStatus;
import com.vanvan.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

@PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','DRIVER')")
    public TripDetailsDTO createTrip(@Valid @RequestBody CreateTripDTO dto) {
        return tripService.createTrip(dto);
    }


    @GetMapping("/history")
    public Page<TripHistoryDTO> listTrips(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) String departureCity,
            @RequestParam(required = false) String arrivalCity,
            @RequestParam(required = false) TripStatus status,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable
    ) {
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"))) {
            // Força busca para o driver logado
            UUID loggedUserId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            driverId = loggedUserId;
        } else if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PASSENGER"))) {
            // Se for passageiro, só vê as próprias viagens buscando pelo histórico restrito dele
            // O ideal seria repassar pro TripService o passengerId para filtrar no Service
            UUID passengerId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return tripService.getPassengerTripHistory(startDate, endDate, departureCity, arrivalCity, status, passengerId, pageable);
        }

        return tripService.getTripHistory(
                startDate,
                endDate,
                driverId,
                departureCity,
                arrivalCity,
                status,
                pageable
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<TripDetailsDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateTripStatusDTO dto) {

        return ResponseEntity.ok(tripService.updateStatus(id, dto.getStatus()));
    }

    @PostMapping("/{id}/book")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<TripDetailsDTO> bookTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.bookTrip(id));
    }

    @PostMapping("/{id}/cancel-booking")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<TripDetailsDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelBooking(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/monitoring")
    public ResponseEntity<Page<TripMonitorDTO>> getMonitoring(
            @RequestParam(required = false) TripStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(tripService.getMonitoringData(status, pageable));
    }

    @GetMapping("/{id}")
    public TripDetailsDTO getTripById(@PathVariable Long id) {
        return tripService.getTripDetails(id);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('PASSENGER')")
    public Page<TripHistoryDTO> searchTrips(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) String departureCity,
            @RequestParam(required = false) String arrivalCity,
            @RequestParam(required = false) Integer passengerCount, // passageiros desejados
            Pageable pageable
    ) {
        // Aproveita o filtro do repositório/service, limitando apenas para agendadas
        return tripService.searchTrips(date, departureCity, arrivalCity, passengerCount, pageable);
    }
}