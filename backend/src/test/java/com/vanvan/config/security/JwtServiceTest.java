package com.vanvan.config.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "minha-chave-secreta-super-longa-para-testes-123456");
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtService.generateToken("alice@email.com");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void validateAndGetSubject_returnsEmail() {
        String token = jwtService.generateToken("alice@email.com");
        String subject = jwtService.validateAndGetSubject(token);
        assertEquals("alice@email.com", subject);
    }

    @Test
    void validateAndGetSubject_invalidToken_throws() {
        assertThrows(Exception.class,
                () -> jwtService.validateAndGetSubject("token.invalido.aqui"));
    }
}