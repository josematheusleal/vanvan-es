package com.vanvan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverWithVehicleResponseDTO {
    private UserResponseDTO driver;
    private VehicleResponseDTO vehicle;
}

