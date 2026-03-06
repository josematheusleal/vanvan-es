package com.vanvan.repository;

import com.vanvan.model.Trip;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TripRepository extends
        JpaRepository<Trip, Long>,
        JpaSpecificationExecutor<Trip> {

    @Override
    @NullMarked
    @EntityGraph(attributePaths = {
            "driver",
            "passengers"
    })
    Optional<Trip> findById(Long id);

    @Override
    @NullMarked
    @EntityGraph(attributePaths = {
            "driver",
            "passengers"
    })
    Page<Trip> findAll(Specification<Trip> spec, Pageable pageable);
}