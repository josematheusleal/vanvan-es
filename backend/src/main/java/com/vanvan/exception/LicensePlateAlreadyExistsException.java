package com.vanvan.exception;

public class LicensePlateAlreadyExistsException extends RuntimeException {
    public LicensePlateAlreadyExistsException(String licensePlate) {
        super("Já existe um veículo cadastrado com a placa: " + licensePlate);
    }
}

