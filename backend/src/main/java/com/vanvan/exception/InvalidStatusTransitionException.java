package com.vanvan.exception;

import com.vanvan.enums.TripStatus;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(TripStatus from, TripStatus to) {
        super("Transição de status inválida: " + from + " → " + to);
    }
}