package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import com.vanvan.model.Trip;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class TripDetailsDTO {

    private Long id; //identificador da viagem

    private LocalDate date; //data da viagem

    private LocalTime time; //horario da viagem

    private String driverName; //nome do motorista

    private List<PassengerDTO> passengers; //lista de passageiros da viagem

    private String departureCity; //cidade de saida

    private String arrivalCity; //cidade de chegada

    private Double perKmRate;

    private Double distanceKm;

    private Double durationMinutes;

    private Double totalAmount;

    private TripStatus status; //status da viagem

    public static TripDetailsDTO fromEntity(Trip trip) {
        return new TripDetailsDTO(
                trip.getId(),
                trip.getDate(),
                trip.getTime(),
                trip.getDriver().getName(),
                trip.getPassengers()
                        .stream()
                        .map(p -> new PassengerDTO(p.getId(), p.getName()))
                        .toList(),
                trip.getDeparture().getCity(),
                trip.getArrival().getCity(),
                trip.getTaxByKM(),
                trip.getDistanceKm(),
                trip.getDurationMinutes(),
                trip.getTotalAmount(),
                trip.getStatus()
        );
    }

}