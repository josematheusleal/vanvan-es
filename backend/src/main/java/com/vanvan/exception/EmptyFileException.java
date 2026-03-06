package com.vanvan.exception;

public class EmptyFileException extends RuntimeException {
    public EmptyFileException(String fileType) {
        super(String.format("O arquivo de %s está vazio. Envie um arquivo válido", fileType));
    }

    public EmptyFileException() {
        super("O arquivo está vazio. Envie um arquivo válido");
    }
}

