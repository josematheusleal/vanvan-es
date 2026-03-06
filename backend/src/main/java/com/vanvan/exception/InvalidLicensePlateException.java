package com.vanvan.exception;

public class InvalidLicensePlateException extends RuntimeException {
    public InvalidLicensePlateException() {
        super("A placa do veículo é inválida. Use o formato Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)");
    }

    public InvalidLicensePlateException(String licensePlate) {
        super(String.format("A placa '%s' é inválida. Use o formato Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)", licensePlate));
    }
}

