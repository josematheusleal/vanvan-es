package com.vanvan.repository;

import com.vanvan.model.Passageiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassageiroRepository extends JpaRepository<Passageiro, String> {
    Passageiro findByCpf(String cpf);
}