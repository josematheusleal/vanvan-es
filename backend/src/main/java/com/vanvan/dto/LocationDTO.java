package com.vanvan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LocationDTO {

    @NotBlank
    private String city;

    @NotBlank
    private String street;

    @NotBlank
    private String reference;
}
