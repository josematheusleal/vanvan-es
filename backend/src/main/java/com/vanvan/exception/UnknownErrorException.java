package com.vanvan.exception;

public class UnknownErrorException extends RuntimeException {
    public UnknownErrorException(String message) {
        super(message);
    }
}
