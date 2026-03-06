package com.vanvan.exception;

public class VehiclePhotoNotFoundException extends RuntimeException {
    public VehiclePhotoNotFoundException() {
        super("Este veículo não possui foto cadastrada");
    }

    public VehiclePhotoNotFoundException(String vehicleId) {
        super(String.format("O veículo '%s' não possui foto cadastrada", vehicleId));
    }
}

