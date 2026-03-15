package com.vanvan.controller;

import com.vanvan.dto.TripDetailsDTO;
import com.vanvan.dto.UpdateTripStatusDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.service.TripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TripController.class)
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TripService tripService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTripById_returns200() throws Exception {
        TripDetailsDTO dto = new TripDetailsDTO(
                1L, LocalDate.now(), LocalTime.of(10, 0),
                "Motorista", List.of(), "Caruaru", "Garanhuns",
                1.5, 130.0, 90.0, 195.0, TripStatus.COMPLETED);

        when(tripService.getTripDetails(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/trips/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listTrips_returns200() throws Exception {
        when(tripService.getTripHistory(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/trips/history")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void updateStatus_returns200() throws Exception {
        TripDetailsDTO dto = new TripDetailsDTO(
                1L, LocalDate.now(), LocalTime.of(10, 0),
                "Motorista", List.of(), "Caruaru", "Garanhuns",
                1.5, 130.0, 90.0, 195.0, TripStatus.IN_PROGRESS);

        when(tripService.updateStatus(any(), any())).thenReturn(dto);

        UpdateTripStatusDTO body = new UpdateTripStatusDTO();
        body.setStatus(TripStatus.IN_PROGRESS);

        mockMvc.perform(patch("/api/trips/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMonitoring_returns200() throws Exception {
        when(tripService.getMonitoringData(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/trips/monitoring")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }
}