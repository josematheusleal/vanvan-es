package com.vanvan.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String modelName;

    @Column(nullable = false, unique = true, length = 8)
    private String licensePlate; // Formato: ABC1D23

    @Column(nullable = false)
    private String documentPath; // Caminho do arquivo PDF do documento

    @Column
    private String photoPath; // Caminho da foto do veículo (opcional)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    public Vehicle(String modelName, String licensePlate, String documentPath, String photoPath, Driver driver) {
        this.modelName = modelName;
        this.licensePlate = licensePlate;
        this.documentPath = documentPath;
        this.photoPath = photoPath;
        this.driver = driver;
    }
}

