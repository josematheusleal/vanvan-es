package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class TripHistoryDTO {

    private Long id; //identificador da viagem

    private LocalDate date; //data da viagem

    private String driverName; //nome do motorista

    private String route; //rota no formato "cidadeSaida - cidadeChegada"

    private Integer passengerCount; //quantidade de passageiros

    private Double totalAmount; //valor total arrecadado

    private TripStatus status; //status da viagem
}