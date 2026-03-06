package com.vanvan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class PassengerDTO { //para lista de passageiros da viagem

    private UUID id; //identificador do passageiro

    private String name; //nome completo do passageiro
}