package com.vanvan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationDTO {

    @NotBlank(message = "Cidade é obrigatória")
    @Size(min = 2, max = 50, message = "Nome da cidade deve ter entre 2 e 50 caracteres")
    private String city;

    @Size(max = 200, message = "Rua deve ter no máximo 200 caracteres")
    private String street;

    @Size(max = 200, message = "Referência deve ter no máximo 200 caracteres")
    private String reference;
}