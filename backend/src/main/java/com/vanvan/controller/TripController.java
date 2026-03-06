package com.vanvan.controller;

import com.vanvan.dto.CreateTripDTO;
import com.vanvan.dto.TripDetailsDTO;
import com.vanvan.dto.TripHistoryDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public TripDetailsDTO createTrip(@RequestBody CreateTripDTO dto) {
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
            Pageable pageable
    ) {

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

    @GetMapping("/{id}")
    public TripDetailsDTO getTripById(@PathVariable Long id) {
        return tripService.getTripDetails(id);
    }
}