package com.vanvan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class UnderageUserException extends RuntimeException {

    public UnderageUserException(){
        super("Usuário está abaixo da idade permitida.");
    }

    public UnderageUserException(String message){
        super(message);
    }
}
