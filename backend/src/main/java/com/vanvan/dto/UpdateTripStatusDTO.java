package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTripStatusDTO {

    @NotNull(message = "Status é obrigatório")
    private TripStatus status;
}