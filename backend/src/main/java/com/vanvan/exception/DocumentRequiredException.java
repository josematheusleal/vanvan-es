package com.vanvan.exception;

public class DocumentRequiredException extends RuntimeException {
    public DocumentRequiredException() {
        super("O documento do veículo é obrigatório. Envie um arquivo PDF válido");
    }
}

