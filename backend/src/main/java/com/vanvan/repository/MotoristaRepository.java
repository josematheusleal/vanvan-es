package com.vanvan.repository;

import com.vanvan.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MotoristaRepository extends JpaRepository<Motorista, String> {
    boolean existsByCnh(String cnh);
    Motorista findByCpf(String cpf);
}