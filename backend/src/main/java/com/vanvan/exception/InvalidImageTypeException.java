package com.vanvan.exception;

public class InvalidImageTypeException extends RuntimeException {
    public InvalidImageTypeException() {
        super("A foto do veículo deve ser uma imagem nos formatos JPG, JPEG ou PNG");
    }

    public InvalidImageTypeException(String message) {
        super(message);
    }
}

