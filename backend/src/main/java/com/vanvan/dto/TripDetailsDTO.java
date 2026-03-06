package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import com.vanvan.model.Trip;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
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

    private BigDecimal totalAmount; //valor total arrecadado

    private TripStatus status; //status da viagem

    public static TripDetailsDTO fromEntity(Trip trip) {

        List<PassengerDTO> passengerDTOs =
                trip.getPassengers()
                        .stream()
                        .map(p -> new PassengerDTO(
                                p.getId(),
                                p.getName()))
                        .toList();

        return new TripDetailsDTO(
                trip.getId(),
                trip.getDate(),
                trip.getTime(),
                trip.getDriver().getName(),
                passengerDTOs,
                trip.getDeparture().getCity(),
                trip.getArrival().getCity(),
                trip.getTotalAmount(),
                trip.getStatus()
        );
    }
}