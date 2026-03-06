package com.vanvan.repository;
import com.vanvan.enums.TripStatus;
import com.vanvan.model.Driver;
import com.vanvan.model.Trip;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


/**
 * classe responsavel por construir filtros dinamicos para consultas de viagens
 * permite combinar opcionalmente:
 * - filtro por periodo (data inicial e final)
 * - filtro por motorista
 * - filtro por rota (cidade de saida ou chegada)
 * os filtros sao aplicados dinamicamente conforme os parametros recebidos
 * a consulta final sera executada pelo repository utilizando findAll(spec, pageable)
 */
public class TripSpecification {
    private TripSpecification() {
    }


    /**
     * constroi uma specification dinamica para a entidade Trip
     *
     * @param startDate data inicial do periodo
     * @param endDate data final do periodo
     * @param driverId identificador do motorista
     * @param departureCity texto para busca parcial na cidade de saida
     * @param arrivalCity texto para busca parcial na cidade de chegada
     *
     * @return specification pronta para ser usada no repository
     */
    public static Specification<Trip> filter(
            LocalDate startDate,
            LocalDate endDate,
            UUID driverId,
            String departureCity,
            String arrivalCity,
            TripStatus status
    ) {

        return (root, query, cb) -> {

            //garante que nao haja duplicacao de registros quando houver join com colecoes
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            //join com motorista para permitir filtro por motorista
            Join<Trip, Driver> driverJoin = root.join("driver", JoinType.LEFT);

            root.join("passengers", JoinType.LEFT);

            //filtro por periodo de datas
            if (startDate != null && endDate != null) {
                predicates.add(
                        cb.between(root.get("date"), startDate, endDate)
                );
            }

            //filtro por motorista especifico
            if (driverId != null) {
                predicates.add(
                        cb.equal(driverJoin.get("id"), driverId)
                );
            }

            //filtro por rota com busca parcial na cidade de saida ou chegada
            if (departureCity != null && !departureCity.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("departure").get("city")),
                                "%" + departureCity.toLowerCase() + "%"
                        )
                );
            }

            if (arrivalCity != null && !arrivalCity.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("arrival").get("city")),
                                "%" + arrivalCity.toLowerCase() + "%"
                        )
                );
            }

            if (status != null) {
                predicates.add(
                        cb.equal(root.get("status"), status)
                );
            }

            //combina todos os filtros aplicados
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}