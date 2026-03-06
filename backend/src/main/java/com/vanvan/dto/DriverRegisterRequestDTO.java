package com.vanvan.dto;

import com.vanvan.enums.UserRole;
import com.vanvan.model.Driver;
import com.vanvan.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class DriverRegisterRequestDTO extends RegisterDTO {

    @NotBlank
    @Pattern(regexp = "\\d{11}")
    private String cnh;

    @NotBlank // sem mais verificações por ora
    private String pixKey;

    // Campos do veículo
    private String vehicleModelName;
    private String vehicleLicensePlate;

    public DriverRegisterRequestDTO(String name, String email, String password, String cpf, String phone, String role, LocalDate birthDate, String cnh) {
        super(name, email, password, cpf, phone, role, birthDate);
        this.cnh = cnh;
    }

    @Override
    public User toEntity() {
        UserRole parsedRole = UserRole.valueOf(role.toUpperCase());
        Driver driver = null;
        if (parsedRole == UserRole.DRIVER) {
            driver = new Driver(
                    name, cpf, phone, email, password,
                    cnh, pixKey, birthDate
            );
        }
        return driver;
    }

}
