package com.vanvan.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.vanvan.enums.RegistrationStatus;
import com.vanvan.model.Driver;

public record DriverAdminResponseDTO(
    UUID id,
    String name,
    String email,
    String phone,
    String cpf,
    String cnh,
    LocalDate birthDate,
    RegistrationStatus registrationStatus,
    String rejectionReason
) {
    public static DriverAdminResponseDTO from(Driver driver) {
        return new DriverAdminResponseDTO(
            driver.getId(),
            driver.getName(),
            driver.getEmail(),
            driver.getPhone(),
            driver.getCpf(),
            driver.getCnh(),
            driver.getBirthDate(),
            driver.getRegistrationStatus(),
            driver.getRejectionReason()
        );
    }
}