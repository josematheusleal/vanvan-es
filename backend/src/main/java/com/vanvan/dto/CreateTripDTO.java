package com.vanvan.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

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

    @NotNull(message = "Capacidade de assentos é obrigatória")
    @Min(value = 1, message = "A viagem deve ter pelo menos 1 assento")
    private Integer totalSeats;

    @NotNull(message = "Local de partida é obrigatório")
    @Valid
    private LocationDTO departure;

    @NotNull(message = "Local de chegada é obrigatório")
    @Valid
    private LocationDTO arrival;

    @Nullable
    private List<UUID> passengerIds;

    @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que zero")
    @DecimalMax(value = "200.00", message = "Preço por passageiro não pode exceder R$ 200,00")//para uma viagem de escopo medio esta bom kkkkkkk
    @Nullable
    private Double perKmRate;

}