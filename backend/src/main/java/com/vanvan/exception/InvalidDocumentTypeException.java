package com.vanvan.exception;

public class InvalidDocumentTypeException extends RuntimeException {
    public InvalidDocumentTypeException() {
        super("O documento do veículo deve ser um arquivo PDF");
    }
}

