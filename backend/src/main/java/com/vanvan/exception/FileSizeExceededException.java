package com.vanvan.exception;

public class FileSizeExceededException extends RuntimeException {
    public FileSizeExceededException(String fileName, long maxSizeInMB) {
        super(String.format("O arquivo '%s' excede o tamanho máximo permitido de %dMB", fileName, maxSizeInMB));
    }

    public FileSizeExceededException(long maxSizeInMB) {
        super(String.format("O arquivo excede o tamanho máximo permitido de %dMB", maxSizeInMB));
    }
}

