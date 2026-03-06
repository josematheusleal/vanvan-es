package com.vanvan.dto;

import com.vanvan.model.Vehicle;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class VehicleResponseDTO {

    private UUID id;
    private String modelName;
    private String licensePlate;
    private String documentPath;
    private String photoPath;
    private UUID driverId;
    private String driverName;

    public static VehicleResponseDTO from(Vehicle vehicle) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(vehicle.getId());
        dto.setModelName(vehicle.getModelName());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setDocumentPath(vehicle.getDocumentPath());
        dto.setPhotoPath(vehicle.getPhotoPath());
        dto.setDriverId(vehicle.getDriver().getId());
        dto.setDriverName(vehicle.getDriver().getName());
        return dto;
    }
}

