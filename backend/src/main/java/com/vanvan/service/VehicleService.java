package com.vanvan.service;

import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.exception.*;
import com.vanvan.model.Driver;
import com.vanvan.model.Vehicle;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final FileStorageService fileStorageService;

    // Constantes para validação
    private static final long MAX_FILE_SIZE_MB = 10;
    private static final long MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    private static final Pattern MERCOSUL_PLATE_PATTERN = Pattern.compile("^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$");
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/jpg", "image/png");

    @Transactional
    public VehicleResponseDTO createVehicle(UUID driverId, String modelName, String licensePlate,
                                           MultipartFile document, MultipartFile photo) throws IOException {

        // Validar se o motorista existe
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UserNotFoundException(com.vanvan.enums.UserRole.DRIVER, driverId));

        // Validar e normalizar placa
        String normalizedPlate = validateAndNormalizeLicensePlate(licensePlate);

        // Validar placa única
        if (vehicleRepository.existsByLicensePlate(normalizedPlate)) {
            throw new LicensePlateAlreadyExistsException(normalizedPlate);
        }

        // Validar documento obrigatório
        if (document == null || document.isEmpty()) {
            throw new DocumentRequiredException();
        }

        // Validar documento (tipo e tamanho)
        validateDocument(document);

        // Armazenar documento
        String documentPath = fileStorageService.storeFile(document, "vehicles/documents");

        // Validar e armazenar foto (opcional)
        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            validatePhoto(photo);
            photoPath = fileStorageService.storeFile(photo, "vehicles/photos");
        }

        // Criar veículo
        Vehicle vehicle = new Vehicle(modelName, normalizedPlate, documentPath, photoPath, driver);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return VehicleResponseDTO.from(savedVehicle);
    }

    private String validateAndNormalizeLicensePlate(String licensePlate) {
        if (licensePlate == null || licensePlate.isBlank()) {
            throw new InvalidLicensePlateException();
        }

        String normalized = licensePlate.toUpperCase().trim();

        if (!MERCOSUL_PLATE_PATTERN.matcher(normalized).matches()) {
            throw new InvalidLicensePlateException(licensePlate);
        }

        return normalized;
    }

    private void validateDocument(MultipartFile document) {
        // Verificar se está vazio
        if (document.isEmpty()) {
            throw new EmptyFileException("documento");
        }

        // Verificar tamanho
        if (document.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new FileSizeExceededException(document.getOriginalFilename(), MAX_FILE_SIZE_MB);
        }

        // Verificar tipo (PDF)
        String contentType = document.getContentType();
        if (contentType == null || !contentType.equals(PDF_CONTENT_TYPE)) {
            throw new InvalidDocumentTypeException();
        }
    }

    private void validatePhoto(MultipartFile photo) {
        // Verificar se está vazio
        if (photo.isEmpty()) {
            throw new EmptyFileException("foto");
        }

        // Verificar tamanho
        if (photo.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new FileSizeExceededException(photo.getOriginalFilename(), MAX_FILE_SIZE_MB);
        }

        // Verificar tipo (JPG/JPEG/PNG)
        String contentType = photo.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidImageTypeException();
        }
    }

    public List<VehicleResponseDTO> getVehiclesByDriver(UUID driverId) {
        return vehicleRepository.findByDriverId(driverId)
                .stream()
                .map(VehicleResponseDTO::from)
                .collect(Collectors.toList());
    }

    public VehicleResponseDTO getVehicleById(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Veículo não encontrado"));
        return VehicleResponseDTO.from(vehicle);
    }

    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(VehicleResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponseDTO updateVehicle(UUID vehicleId, String modelName, String licensePlate,
                                           MultipartFile document, MultipartFile photo) throws IOException {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Veículo não encontrado"));

        // Atualizar modelo se fornecido
        if (modelName != null && !modelName.isBlank()) {
            vehicle.setModelName(modelName);
        }

        // Atualizar placa se fornecida
        if (licensePlate != null && !licensePlate.isBlank()) {
            String normalizedPlate = validateAndNormalizeLicensePlate(licensePlate);

            if (!normalizedPlate.equals(vehicle.getLicensePlate()) &&
                vehicleRepository.existsByLicensePlate(normalizedPlate)) {
                throw new LicensePlateAlreadyExistsException(licensePlate);
            }
            vehicle.setLicensePlate(normalizedPlate);
        }

        // Atualizar documento se fornecido
        if (document != null && !document.isEmpty()) {
            validateDocument(document);

            // Deletar documento antigo
            fileStorageService.deleteFile(vehicle.getDocumentPath());

            // Armazenar novo documento
            String documentPath = fileStorageService.storeFile(document, "vehicles/documents");
            vehicle.setDocumentPath(documentPath);
        }

        // Atualizar foto se fornecida
        if (photo != null && !photo.isEmpty()) {
            validatePhoto(photo);

            // Deletar foto antiga se existir
            if (vehicle.getPhotoPath() != null) {
                fileStorageService.deleteFile(vehicle.getPhotoPath());
            }

            // Armazenar nova foto
            String photoPath = fileStorageService.storeFile(photo, "vehicles/photos");
            vehicle.setPhotoPath(photoPath);
        }

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponseDTO.from(updatedVehicle);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Veículo não encontrado"));

        // Deletar arquivos
        fileStorageService.deleteFile(vehicle.getDocumentPath());
        if (vehicle.getPhotoPath() != null) {
            fileStorageService.deleteFile(vehicle.getPhotoPath());
        }

        vehicleRepository.delete(vehicle);
    }

    public byte[] getVehicleDocument(UUID vehicleId) throws IOException {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Veículo não encontrado"));
        return fileStorageService.loadFile(vehicle.getDocumentPath());
    }

    public byte[] getVehiclePhoto(UUID vehicleId) throws IOException {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Veículo não encontrado"));

        if (vehicle.getPhotoPath() == null) {
            throw new VehiclePhotoNotFoundException(vehicleId.toString());
        }

        return fileStorageService.loadFile(vehicle.getPhotoPath());
    }
}

