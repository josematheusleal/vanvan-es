package com.vanvan.repository;

import com.vanvan.enums.TripStatus;
import com.vanvan.model.Trip;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TripSpecificationTest {

    @Test
    void filter_allNull_returnsSpec() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, null, null, null);
        assertNotNull(spec);
    }

    @Test
    void filter_withDateRange() {
        Specification<Trip> spec = TripSpecification.filter(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                null, null, null, null);
        assertNotNull(spec);
    }

    @Test
    void filter_withDriverId() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, UUID.randomUUID(), null, null, null);
        assertNotNull(spec);
    }

    @Test
    void filter_withDepartureCity() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, "Caruaru", null, null);
        assertNotNull(spec);
    }

    @Test
    void filter_withArrivalCity() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, null, "Garanhuns", null);
        assertNotNull(spec);
    }

    @Test
    void filter_withStatus() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, null, null, TripStatus.COMPLETED);
        assertNotNull(spec);
    }

    @Test
    void filter_allCombined() {
        Specification<Trip> spec = TripSpecification.filter(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                UUID.randomUUID(),
                "Caruaru",
                "Garanhuns",
                TripStatus.IN_PROGRESS);
        assertNotNull(spec);
    }

    @Test
    void filter_blankDepartureCity_notAdded() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, "  ", null, null);
        assertNotNull(spec);
    }

    @Test
    void filter_blankArrivalCity_notAdded() {
        Specification<Trip> spec = TripSpecification.filter(
                null, null, null, null, "  ", null);
        assertNotNull(spec);
    }
}