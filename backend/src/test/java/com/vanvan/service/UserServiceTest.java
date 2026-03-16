package com.vanvan.service;

import com.vanvan.dto.DriverRegisterRequestDTO;
import com.vanvan.dto.RegisterRequestDTO;
import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.exception.*;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.UUID;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PassengerRepository passengerRepository;
    @Mock private DriverRepository driverRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private VehicleService vehicleService;

    @InjectMocks private UserService userService;

    @Test
    @DisplayName("Deve salvar Motorista com CNH")
    void shouldRegisterDriver() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "Vanvan", "van@email.com", "senha123",
                "12345678900", "81988888888", "DRIVER",
                LocalDate.of(2003, 10, 13), "99988877700");
        dto.setPixKey("chave-pix-da-van");
        when(passwordEncoder.encode(anyString())).thenReturn("senhaCriptografada");
        userService.register(dto);
        verify(driverRepository, times(1)).save(any(Driver.class));
    }

    @Test
    @DisplayName("Deve lançar exceção se e-mail já existir")
    void shouldThrowWhenEmailExists() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "Vanvan", "jaexiste@email.com", "senha",
                "12345678900", "819", "DRIVER",
                LocalDate.of(2000, 1, 1), "999");
        when(userRepository.findByEmail(anyString())).thenReturn(new Driver());
        assertThrows(EmailAlreadyExistsException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve lançar exceção se CPF já existir")
    void shouldThrowWhenCpfExists() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "Vanvan", "novo@email.com", "senha",
                "cpf-existente", "819", "DRIVER",
                LocalDate.of(2000, 1, 1), "999");
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(new Driver());
        assertThrows(CpfAlreadyExistsException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve lançar exceção se CNH já existir")
    void shouldThrowWhenCnhExists() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "Vanvan", "novo@email.com", "senha",
                "123", "819", "DRIVER",
                LocalDate.of(2000, 1, 1), "cnh-existente");
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(null);
        when(driverRepository.existsByCnh(anyString())).thenReturn(true);
        assertThrows(CnhAlreadyExistsException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve lançar exceção para Motorista menor de 21 anos")
    void shouldThrowWhenDriverIsUnder21() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "Vanvan", "novo@email.com", "senha",
                "123", "819", "DRIVER",
                LocalDate.now().minusYears(20), "111");
        assertThrows(UnderageDriverException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve registrar passageiro com sucesso")
    void register_passenger_success() {
        RegisterRequestDTO dto = new RegisterRequestDTO(
                "Alice", "alice@email.com", "senha123",
                "52998224725", "81988888888", "passenger",
                LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(passengerRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        var result = userService.register(dto);
        assertNotNull(result);
        verify(passengerRepository).save(any(Passenger.class));
    }

    @Test
    @DisplayName("Deve lançar exceção para passageiro menor de 18 anos")
    void register_underage_passenger_throws() {
        RegisterRequestDTO dto = new RegisterRequestDTO(
                "Minor", "minor@email.com", "senha123",
                "52998224725", "81988888888", "passenger",
                LocalDate.now().minusYears(17));
        assertThrows(UnderageUserException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve registrar driver com sucesso")
    void register_driver_success() {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "João", "joao@email.com", "senha123",
                "52998224725", "81988888888", "driver",
                LocalDate.of(1990, 1, 1), "12345678900");
        dto.setPixKey("pix");
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(null);
        when(driverRepository.existsByCnh(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(driverRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        var result = userService.register(dto);
        assertNotNull(result);
        verify(driverRepository).save(any(Driver.class));
    }

    @Test
    @DisplayName("Deve lançar exceção para passageiro com CPF duplicado")
    void register_cpfExists_passenger_throws() {
        RegisterRequestDTO dto = new RegisterRequestDTO(
                "Alice", "alice@email.com", "senha123",
                "52998224725", "81988888888", "passenger",
                LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(new Passenger());
        assertThrows(CpfAlreadyExistsException.class, () -> userService.register(dto));
    }

    @Test
    @DisplayName("Deve lançar exceção para passageiro com email duplicado")
    void register_emailExists_passenger_throws() {
        RegisterRequestDTO dto = new RegisterRequestDTO(
                "Alice", "alice@email.com", "senha123",
                "52998224725", "81988888888", "passenger",
                LocalDate.of(2000, 1, 1));
        when(userRepository.findByEmail(anyString())).thenReturn(new Passenger());
        assertThrows(EmailAlreadyExistsException.class, () -> userService.register(dto));
    }
    // ── updateDriverRate ──────────────────────────────────────────

    @Test
    @DisplayName("Deve atualizar tarifa do motorista com sucesso")
    void updateDriverRate_sucesso() {
        Driver driver = new Driver();
        driver.setRatePerKm(1.0);

        when(driverRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Double result = userService.updateDriverRate(driver, 1.0);

        assertEquals(1.0, result);
        verify(driverRepository).save(driver);
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não é motorista")
    void updateDriverRate_naoEMotorista_throws() {
        Passenger passenger = new Passenger();

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateDriverRate(passenger, 1.0));
    }

    @Test
    @DisplayName("Deve lançar exceção quando tarifa é menor que 0.50")
    void updateDriverRate_tarifaAbaixoDoMinimo_throws() {
        Driver driver = new Driver();

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateDriverRate(driver, 0.49));
    }

    @Test
    @DisplayName("Deve lançar exceção quando tarifa é maior que 1.50")
    void updateDriverRate_tarifaAcimaDoMaximo_throws() {
        Driver driver = new Driver();

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateDriverRate(driver, 1.51));
    }

// ── registerDriverWithVehicle ─────────────────────────────────

    @Test
    @DisplayName("Deve lançar exceção quando placa já existe")
    void registerDriverWithVehicle_placaJaExiste_throws(){
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "João", "joao@email.com", "senha123",
                "52998224725", "81988888888", "driver",
                LocalDate.of(1990, 1, 1), "12345678900");
        dto.setPixKey("pix");

        when(vehicleService.isLicensePlateTaken("ABC1D23")).thenReturn(true);

        assertThrows(LicensePlateAlreadyExistsException.class,
                () -> userService.registerDriverWithVehicle(
                        dto, "Sprinter", "ABC1D23",
                        mock(MultipartFile.class), mock(MultipartFile.class)));
    }

    @Test
    @DisplayName("Deve registrar motorista com veículo com sucesso")
    void registerDriverWithVehicle_sucesso() throws IOException {
        DriverRegisterRequestDTO dto = new DriverRegisterRequestDTO(
                "João", "joao@email.com", "senha123",
                "52998224725", "81988888888", "driver",
                LocalDate.of(1990, 1, 1), "12345678900");
        dto.setPixKey("pix");

        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setName("João");
        driver.setEmail("joao@email.com");
        driver.setRole(com.vanvan.enums.UserRole.DRIVER);

        VehicleResponseDTO vehicleResponse = mock(VehicleResponseDTO.class);
        MultipartFile doc = mock(MultipartFile.class);
        MultipartFile photo = mock(MultipartFile.class);

        when(vehicleService.isLicensePlateTaken("ABC1D23")).thenReturn(false);
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(userRepository.findByCpf(anyString())).thenReturn(null);
        when(driverRepository.existsByCnh(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(driverRepository.save(any())).thenReturn(driver);
        when(vehicleService.createVehicle(any(), any(), any(), any(), any()))
                .thenReturn(vehicleResponse);

        var result = userService.registerDriverWithVehicle(
                dto, "Sprinter", "ABC1D23", doc, photo);

        assertNotNull(result);
        verify(vehicleService).createVehicle(any(), eq("Sprinter"), eq("ABC1D23"), eq(doc), eq(photo));
    }
}