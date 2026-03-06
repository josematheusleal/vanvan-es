package com.vanvan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VehicleCreateDTO {

    @NotBlank(message = "Nome do modelo é obrigatório")
    private String modelName;

    @NotBlank(message = "Placa é obrigatória")
    @Pattern(regexp = "^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$",
             message = "Placa deve estar no formato ABC1D23 (padrão Mercosul)")
    private String licensePlate;

    // Os arquivos serão enviados via multipart, não no JSON
}

