package com.vanvan.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vanvan.model.Driver;
import com.vanvan.model.User;
import com.vanvan.model.User;
import com.vanvan.repository.UserRepository;
import com.vanvan.service.UserService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Object> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        if (user instanceof Driver driver) {
            response.put("registrationStatus", driver.getRegistrationStatus().name());
            response.put("rejectionReason", driver.getRejectionReason());
            response.put("ratePerKm", driver.getRatePerKm());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/rate")
    public ResponseEntity<Object> updateRate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Double> payload) {
        User user = userRepository.findByEmail(userDetails.getUsername());
        if (user == null || !payload.containsKey("ratePerKm")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Double updatedRate = userService.updateDriverRate(user, payload.get("ratePerKm"));
            Map<String, Object> response = new HashMap<>();
            response.put("ratePerKm", updatedRate);
            response.put("message", "Tarifa atualizada com sucesso.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
