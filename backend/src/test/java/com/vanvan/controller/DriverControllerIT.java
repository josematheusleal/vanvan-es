package com.vanvan.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DriverControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve retornar erro 400 ao tentar cadastrar motorista com CPF inválido")
    void deveRetornarErroAoCadastrarCpfInvalido() throws Exception {
        String driverJson = """
        {
            "name": "Melissa Pessoa",
            "cpf": "123",
            "phone": "87999999999",
            "email": "melissa@ufape.edu.br",
            "password": "senha",
            "cnh": "123456789",
            "role": "driver",
            "pixKey": "pix-mel",
            "birthDate": "01/01/2000",
            "vehicleModelName": "Fiat Uno",
            "vehicleLicensePlate": "ABC1D23"
        }
        """;

        MockMultipartFile driverPart = new MockMultipartFile(
                "driver", "", "application/json", driverJson.getBytes());

        MockMultipartFile documentPart = new MockMultipartFile(
                "vehicleDocument", "doc.pdf", "application/pdf", "conteudo".getBytes());

        mockMvc.perform(multipart("/api/auth/register-driver")
                        .file(driverPart)
                        .file(documentPart))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN deve conseguir listar motoristas filtrando por status PENDENTE")
    void deveListarMotoristasComFiltroStatus() throws Exception {
        mockMvc.perform(get("/api/admin/drivers")
                .param("status", "PENDING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Usuário comum (USER) não deve ter acesso a endpoints administrativos")
    void usuarioComumNaoDeveAcessarEndpointsAdministrativos() throws Exception {
        mockMvc.perform(get("/api/admin/drivers"))
                .andExpect(status().isForbidden()); // Erro 403 - Proibido
    }
}