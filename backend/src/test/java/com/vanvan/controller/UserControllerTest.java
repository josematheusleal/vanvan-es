package com.vanvan.controller;

import java.util.UUID;

import com.vanvan.service.UserService;
import org.jspecify.annotations.NullMarked;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.vanvan.enums.RegistrationStatus;
import com.vanvan.enums.UserRole;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.User;
import com.vanvan.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    // adicionar no setup do @Mock
    @Mock
    private UserService userService;


    private UserDetails userDetailsMock;

    @BeforeEach
    void setup() {
        // Criamos o mock do UserDetails que será usado no @AuthenticationPrincipal
        userDetailsMock = mock(UserDetails.class);

        UserController userController = new UserController(userRepository, userService);

        // Custom Resolver para injetar o mock de UserDetails nos testes
        HandlerMethodArgumentResolver authResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(org.springframework.security.core.annotation.AuthenticationPrincipal.class);
            }

            @Override
            @NullMarked
            public Object resolveArgument(MethodParameter  parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return userDetailsMock;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setCustomArgumentResolvers(authResolver)
                .build();
    }

    @Test
    @DisplayName("Deve retornar 200 e dados básicos para Passageiro logado")
    void mePassengerSuccess() throws Exception {
        User user = new Passenger();
        user.setId(UUID.randomUUID());
        user.setName("Melissa Pessoa");
        user.setEmail("melissa@ufape.edu.br");
        user.setRole(UserRole.PASSENGER);

        when(userDetailsMock.getUsername()).thenReturn("melissa@ufape.edu.br");
        when(userRepository.findByEmail("melissa@ufape.edu.br")).thenReturn(user);

        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Melissa Pessoa"))
                .andExpect(jsonPath("$.role").value("PASSENGER"));
    }

    @Test
    @DisplayName("Deve retornar 200 e status de registro para Motorista logado")
    void meDriverSuccess() throws Exception {
        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setName("Motorista Vanvan");
        driver.setEmail("driver@vanvan.com");
        driver.setRole(UserRole.DRIVER);
        driver.setRegistrationStatus(RegistrationStatus.APPROVED);
        driver.setRejectionReason(null);

        when(userDetailsMock.getUsername()).thenReturn("driver@vanvan.com");
        when(userRepository.findByEmail("driver@vanvan.com")).thenReturn(driver);

        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationStatus").value("APPROVED"))
                .andExpect(jsonPath("$.role").value("DRIVER"));
    }

    @Test
    @DisplayName("Deve retornar 404 quando o usuário logado não existe no banco")
    void meNotFound() throws Exception {
        when(userDetailsMock.getUsername()).thenReturn("fantasma@vanvan.com");
        when(userRepository.findByEmail("fantasma@vanvan.com")).thenReturn(null);

        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve retornar ratePerKm no /me para Motorista")
    void meDriverComRatePerKm() throws Exception {
        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setName("Motorista Vanvan");
        driver.setEmail("driver@vanvan.com");
        driver.setRole(UserRole.DRIVER);
        driver.setRegistrationStatus(RegistrationStatus.APPROVED);
        driver.setRejectionReason(null);
        driver.setRatePerKm(2.5);

        when(userDetailsMock.getUsername()).thenReturn("driver@vanvan.com");
        when(userRepository.findByEmail("driver@vanvan.com")).thenReturn(driver);

        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ratePerKm").value(2.5));
    }

// ── PUT /rate ─────────────────────────────────────────────────

    @Test
    @DisplayName("Deve retornar 400 quando usuário não existe ao atualizar rate")
    void updateRate_usuarioNaoEncontrado() throws Exception {
        when(userDetailsMock.getUsername()).thenReturn("fantasma@vanvan.com");
        when(userRepository.findByEmail("fantasma@vanvan.com")).thenReturn(null);

        mockMvc.perform(put("/api/user/rate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"ratePerKm\": 2.0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando payload não contém ratePerKm")
    void updateRate_payloadSemCampo() throws Exception {
        User user = new Passenger();
        user.setId(UUID.randomUUID());
        user.setEmail("melissa@ufape.edu.br");
        user.setRole(UserRole.PASSENGER);

        when(userDetailsMock.getUsername()).thenReturn("melissa@ufape.edu.br");
        when(userRepository.findByEmail("melissa@ufape.edu.br")).thenReturn(user);

        mockMvc.perform(put("/api/user/rate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"outrocampo\": 2.0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 e nova tarifa ao atualizar rate com sucesso")
    void updateRate_sucesso() throws Exception {
        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setEmail("driver@vanvan.com");
        driver.setRole(UserRole.DRIVER);
        driver.setRegistrationStatus(RegistrationStatus.APPROVED);

        when(userDetailsMock.getUsername()).thenReturn("driver@vanvan.com");
        when(userRepository.findByEmail("driver@vanvan.com")).thenReturn(driver);
        when(userService.updateDriverRate(driver, 2.0)).thenReturn(2.0);

        mockMvc.perform(put("/api/user/rate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"ratePerKm\": 2.0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ratePerKm").value(2.0))
                .andExpect(jsonPath("$.message").value("Tarifa atualizada com sucesso."));
    }

    @Test
    @DisplayName("Deve retornar 400 quando tarifa é inválida")
    void updateRate_tarifaInvalida() throws Exception {
        Driver driver = new Driver();
        driver.setId(UUID.randomUUID());
        driver.setEmail("driver@vanvan.com");
        driver.setRole(UserRole.DRIVER);
        driver.setRegistrationStatus(RegistrationStatus.APPROVED);

        when(userDetailsMock.getUsername()).thenReturn("driver@vanvan.com");
        when(userRepository.findByEmail("driver@vanvan.com")).thenReturn(driver);
        when(userService.updateDriverRate(driver, 999.0))
                .thenThrow(new IllegalArgumentException("Tarifa fora do intervalo permitido"));

        mockMvc.perform(put("/api/user/rate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"ratePerKm\": 999.0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Tarifa fora do intervalo permitido"));
    }
}