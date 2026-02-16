package com.vanvan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UnderageDriverException extends RuntimeException  {

    public UnderageDriverException() {
        super("Motorista está abaixo da idade mínima permitida.");
    }

    public UnderageDriverException(String message) {
        super(message);
    }
}
