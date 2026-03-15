package com.vanvan.service;

import com.vanvan.dto.*;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.DriverNotFoundException;
import com.vanvan.exception.InvalidStatusTransitionException;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.Location;
import com.vanvan.model.Pricing;
import com.vanvan.model.Trip;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.TripRepository;
import com.vanvan.repository.TripSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final PassengerRepository passengerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final GeocodingService geocodingService;
    private final RoutingService routingService;
    private final PricingService pricingService;

    // Mapa de transições permitidas: status atual → set de próximos status válidos
    private static final Map<TripStatus, Set<TripStatus>> ALLOWED_TRANSITIONS = Map.of(
            TripStatus.SCHEDULED, Set.of(TripStatus.IN_PROGRESS, TripStatus.CANCELLED),
            TripStatus.IN_PROGRESS, Set.of(TripStatus.COMPLETED),
            TripStatus.COMPLETED, Set.of(),
            TripStatus.CANCELLED, Set.of()
    );

    public TripDetailsDTO createTrip(CreateTripDTO dto) {

        var driver = driverRepository.findById(dto.getDriverId())
                .orElseThrow(DriverNotFoundException::new);

        var departureDTO = dto.getDeparture();
        var arrivalDTO = dto.getArrival();

        // 1. Geocodifica as cidades via Nominatim
        double[] originCoords = geocodingService.getCoordinates(departureDTO.getCity());
        double[] destinationCoords = geocodingService.getCoordinates(arrivalDTO.getCity());

        // 2. Calcula rota via OSRM
        RoutingService.RouteResult route = routingService.calculateRoute(originCoords, destinationCoords);

        // 3. Calcula totalAmount
        double totalAmount = getTotalAmount(dto, route);

        // 4. Monta e salva a Trip
        Trip trip = new Trip();
        trip.setDriver(driver);
        trip.setDeparture(new Location(departureDTO.getCity(), departureDTO.getStreet(), departureDTO.getReference()));
        trip.setArrival(new Location(arrivalDTO.getCity(), arrivalDTO.getStreet(), arrivalDTO.getReference()));
        trip.setDate(dto.getDate());
        trip.setTime(dto.getTime());
        trip.setPassengers(passengerRepository.findAllById(dto.getPassengerIds()));
        trip.setStatus(TripStatus.SCHEDULED);
        trip.setDistanceKm(route.distanceKm());
        trip.setTaxByKM(dto.getPerKmRate());
        trip.setDurationMinutes(route.durationMinutes());
        trip.setTotalAmount(totalAmount);

        tripRepository.save(trip);
        return TripDetailsDTO.fromEntity(trip);
    }

    /**
     * Calcula o total arrecadado na viagem.
     * Fórmula:
     * pricePerPassenger = max(minimumFare, perKmRate × distanceKm)
     * totalAmount = pricePerPassenger × numberOfPassengers
     * O motorista pode definir seu próprio perKmRate.
     * Se não definir, usa o perKmRate padrão do Pricing.
     * O minimumFare do Pricing sempre é respeitado como piso mínimo por passageiro.
     */
    private double getTotalAmount(CreateTripDTO dto, RoutingService.RouteResult route) {
        Pricing pricing = pricingService.getPricing(); // chamada única

        double perKmRate = dto.getPerKmRate() != null
                ? dto.getPerKmRate()
                : pricing.getPerKmRate();

        // garante que viagens curtas não fiquem abaixo do mínimo
        double pricePerPassenger = Math.max(
                pricing.getMinimumFare(),
                perKmRate * route.distanceKm()
        );

        return pricePerPassenger * dto.getPassengerIds().size();
    }

    @Transactional
    public TripDetailsDTO updateStatus(Long tripId, TripStatus newStatus) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException(tripId.toString()));

        // extrai o driverId do token JWT via SecurityContext
        UUID driverId = (UUID) Objects.requireNonNull(SecurityContextHolder.getContext()
                        .getAuthentication())
                .getPrincipal();

        if (!trip.getDriver().getId().equals(driverId)) {
            throw new AccessDeniedException("Você não tem permissão para atualizar esta viagem");
        }

        TripStatus currentStatus = trip.getStatus();
        Set<TripStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new InvalidStatusTransitionException(currentStatus, newStatus);
        }

        trip.setStatus(newStatus);
        tripRepository.save(trip);
        broadcastSnapshot();

        return TripDetailsDTO.fromEntity(trip);
    }

    // busca histórico de viagens com filtros dinâmicos
    public Page<TripHistoryDTO> getTripHistory(
            LocalDate startDate, LocalDate endDate,
            UUID driverId,
            String departureCity,
            String arrivalCity,
            TripStatus status,
            Pageable pageable
    ) {
        return tripRepository.findAll(
                TripSpecification.filter(startDate, endDate, driverId, departureCity, arrivalCity, status),
                pageable
        ).map(this::toHistoryDTO);
    }

    // busca detalhes de uma viagem pelo id
    public TripDetailsDTO getTripDetails(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new TripNotFoundException(id.toString()));
        return TripDetailsDTO.fromEntity(trip);
    }

    // retorna snapshot de todas as viagens para o painel de monitoramento do admin
    public Page<TripMonitorDTO> getMonitoringData(TripStatus status, Pageable pageable) {
        return tripRepository.findAll(
                TripSpecification.filter(null, null, null, null, null, status),
                pageable
        ).map(TripMonitorDTO::fromEntity);
    }

    // a cada 15 segundos empurra as viagens IN_PROGRESS para os admins conectados
    @Scheduled(fixedDelay = 15000)
    public void broadcastActiveTrips() {
        broadcastSnapshot();
    }

    // ── helpers ──────────────────────────────────────────────────

    private void broadcastSnapshot() {
        List<TripMonitorDTO> activeTrips = tripRepository.findAll(
                TripSpecification.filter(null, null, null, null, null, TripStatus.IN_PROGRESS),
                Pageable.unpaged()
        ).map(TripMonitorDTO::fromEntity).getContent();

        messagingTemplate.convertAndSend("/topic/monitoring", activeTrips);
    }

    private TripHistoryDTO toHistoryDTO(Trip trip) {
        String route = trip.getDeparture().getCity() + " -> " + trip.getArrival().getCity();
        return new TripHistoryDTO(
                trip.getId(),
                trip.getDate(),
                trip.getDriver().getName(),
                route,
                trip.getPassengers().size(),
                trip.getTotalAmount(),
                trip.getStatus()
        );
    }
}