package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateTripDTO {

    @NotNull(message = "DriverId é obrigatório")
    private UUID driverId;

    @NotNull(message = "Data da viagem é obrigatória")
    @FutureOrPresent(message = "A data da viagem deve ser hoje ou futura")
    private LocalDate date;

    @NotNull(message = "Horário da viagem é obrigatório")
    private LocalTime time;

    @NotBlank(message = "Local de partida é obrigatório")
    private LocationDTO departure;

    @NotBlank(message = "Local de chegada é obrigatório")
    private LocationDTO arrival;

    @NotNull(message = "Lista de passageiros não pode ser nula")
    @Size(min = 1, message = "A viagem deve ter pelo menos um passageiro")
    private List<UUID> passengerIds;

    @NotNull(message = "Valor total é obrigatório")
    @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero")
    private BigDecimal totalAmount;

    @NotNull(message = "Status é obrigatório")
    private TripStatus status;
}