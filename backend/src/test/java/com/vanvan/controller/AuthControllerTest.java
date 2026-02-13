package com.vanvan.controller;

import com.vanvan.config.security.JwtService;
import com.vanvan.dto.LoginRequestDTO;
import com.vanvan.dto.RegisterRequestDTO;
import com.vanvan.dto.TokenResponseDTO;
import com.vanvan.model.Passenger;
import com.vanvan.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @InjectMocks
    private AuthController authController; // Cria o controller injetando os mocks

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserService userService;
    @Mock private JwtService jwtService;

    @Test
    @DisplayName("Deve retornar Status 201 (Created) ao registrar")
    void shouldRegisterUserSuccessfully() {
        // ARRANGE
        var dto = new RegisterRequestDTO(
            "passenger", "Teste", "teste@email.com", "123", "111", "222"
        );
        
        var userSalvo = new Passenger();
        userSalvo.setId("1");
        userSalvo.setName("Teste");

        when(userService.register(dto)).thenReturn(userSalvo);

        // ACT (Chamamos o método direto, como Java normal)
        var response = authController.register(dto);

        // ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Deve retornar Token ao logar")
    void shouldLoginSuccessfully() {
        // ARRANGE
        var loginDto = new LoginRequestDTO("teste@email.com", "123");
        
        // Mocks complexos do Spring Security
        Authentication authMock = mock(Authentication.class);
        UserDetails userDetailsMock = mock(UserDetails.class);
        
        when(userDetailsMock.getUsername()).thenReturn("teste@email.com");
        when(authMock.getPrincipal()).thenReturn(userDetailsMock);
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authMock);
            
        when(jwtService.generateToken("teste@email.com")).thenReturn("token.jwt.falso");

        // ACT
        var response = authController.login(loginDto);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        // Verifica se dentro da resposta tem o token
        var body = (TokenResponseDTO) response.getBody();
        assertEquals("token.jwt.falso", body.token());
    }
}