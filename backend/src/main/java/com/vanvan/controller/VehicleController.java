package com.vanvan.controller;

import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.service.VehicleService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VehicleResponseDTO> createVehicle(
            @RequestParam UUID driverId,
            @RequestParam @NotBlank String modelName,
            @RequestParam @NotBlank @Pattern(regexp = "^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$") String licensePlate,
            @RequestParam MultipartFile document,
            @RequestParam(required = false) MultipartFile photo) throws IOException {

        VehicleResponseDTO vehicle = vehicleService.createVehicle(driverId, modelName, licensePlate, document, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
    }

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByDriver(driverId));
    }

    @GetMapping("/{vehicleId}")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @PutMapping(value = "/{vehicleId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable UUID vehicleId,
            @RequestParam(required = false) String modelName,
            @RequestParam(required = false) String licensePlate,
            @RequestParam(required = false) MultipartFile document,
            @RequestParam(required = false) MultipartFile photo) throws IOException {

        VehicleResponseDTO vehicle = vehicleService.updateVehicle(vehicleId, modelName, licensePlate, document, photo);
        return ResponseEntity.ok(vehicle);
    }

    @DeleteMapping("/{vehicleId}")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{vehicleId}/document")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getVehicleDocument(@PathVariable UUID vehicleId) throws IOException {
        byte[] document = vehicleService.getVehicleDocument(vehicleId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "vehicle-document.pdf");
        return ResponseEntity.ok().headers(headers).body(document);
    }

    @GetMapping("/{vehicleId}/photo")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getVehiclePhoto(@PathVariable UUID vehicleId) throws IOException {
        byte[] photo = vehicleService.getVehiclePhoto(vehicleId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        return ResponseEntity.ok().headers(headers).body(photo);
    }
}

