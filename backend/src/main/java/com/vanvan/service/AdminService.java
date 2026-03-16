package com.vanvan.service;

import com.vanvan.dto.ClientRequestDTO;
import com.vanvan.dto.ClientResponseDTO;
import com.vanvan.dto.DriverAdminResponseDTO;
import com.vanvan.dto.DriverStatusUpdateDTO;
import com.vanvan.dto.DriverUpdateDTO;
import com.vanvan.enums.RegistrationStatus;
import com.vanvan.enums.UserRole;
import com.vanvan.exception.UserNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.User;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;

    public Page<DriverAdminResponseDTO> listDrivers(RegistrationStatus status, Pageable pageable) {
        if (status != null) {
            return driverRepository.findByRegistrationStatus(status, pageable)
                    .map(DriverAdminResponseDTO::from);
        } else {
            return driverRepository.findAll(pageable)
                    .map(DriverAdminResponseDTO::from);
        }
    }

    public DriverAdminResponseDTO updateDriverStatus(UUID driverId, DriverStatusUpdateDTO dto) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UserNotFoundException(UserRole.DRIVER, driverId));

        if (dto.status() == RegistrationStatus.REJECTED &&
                (dto.rejectionReason() == null || dto.rejectionReason().isBlank())) {
            throw new IllegalArgumentException("O motivo da rejeição é obrigatório.");
        }

        driver.setRegistrationStatus(dto.status());

        if (dto.status() == RegistrationStatus.REJECTED) {
            driver.setRejectionReason(dto.rejectionReason());
        } else {
            driver.setRejectionReason(null);
        }
        return DriverAdminResponseDTO.from(driverRepository.save(driver));
    }

    public DriverAdminResponseDTO updateDriver(UUID driverId, DriverUpdateDTO dto) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UserNotFoundException(UserRole.DRIVER, driverId));

        if (dto.name() != null && !dto.name().isBlank()) driver.setName(dto.name());
        if (dto.email() != null && !dto.email().isBlank()) driver.setEmail(dto.email());
        if (dto.phone() != null && !dto.phone().isBlank()) driver.setPhone(dto.phone());
        if (dto.cnh() != null && !dto.cnh().isBlank()) driver.setCnh(dto.cnh());
        if (dto.cpf() != null && !dto.cpf().isBlank()) driver.setCpf(dto.cpf());
        if (dto.registrationStatus() != null) driver.setRegistrationStatus(dto.registrationStatus());

        return DriverAdminResponseDTO.from(driverRepository.save(driver));
    }

    public void deleteDriver(UUID driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new UserNotFoundException(UserRole.DRIVER, driverId));
        driverRepository.delete(driver);
    }

    public Page<ClientResponseDTO> listClients(String name, String cpf, String email, Pageable pageable) {
        return passengerRepository.findByFilters(name, cpf, email, pageable)
                .map(ClientResponseDTO::from);
    }

    public Passenger getClientById(UUID id) {
        return (Passenger) userRepository.findById(id)
                .filter(u -> u instanceof Passenger)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Cliente não encontrado ou não é um passageiro."));
    }

    @Transactional
    public ClientResponseDTO createClient(ClientRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe um usuário com este email.");
        }
        if (userRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("Já existe um usuário com este CPF.");
        }
        Passenger passenger = new Passenger(
                dto.getName(), dto.getCpf(), dto.getPhone(),
                dto.getEmail(), null, dto.getBirthDate()
        );
        return ClientResponseDTO.from(passengerRepository.save(passenger));
    }

    @Transactional
    public ClientResponseDTO updateClient(UUID clientId, ClientRequestDTO dto) {
        User user = getClientById(clientId);

        if (dto.getName() != null && !dto.getName().isBlank()) user.setName(dto.getName());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) user.setPhone(dto.getPhone());

        return ClientResponseDTO.from((Passenger) userRepository.save(user));
    }

    @Transactional
    public void deleteClient(UUID clientId) {
        User user = getClientById(clientId);
        user.setActive(false);
        userRepository.save(user);
    }
}