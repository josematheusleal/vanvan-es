package com.vanvan.model;

import com.vanvan.enums.TripStatus;
import com.vanvan.enums.UserRole;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ModelTest {

    // trip
    @Test
    void trip_addPassenger() {
        Trip trip = new Trip();
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        trip.addPassenger(passenger);

        assertTrue(trip.getPassengers().contains(passenger));
        assertTrue(passenger.getTrips().contains(trip));
    }

    @Test
    void trip_removePassenger() {
        Trip trip = new Trip();
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        trip.addPassenger(passenger);
        trip.removePassenger(passenger);

        assertFalse(trip.getPassengers().contains(passenger));
        assertFalse(passenger.getTrips().contains(trip));
    }

    @Test
    void trip_settersAndGetters() {
        Trip trip = new Trip();
        Driver driver = new Driver();
        driver.setName("Motorista");

        trip.setId(1L);
        trip.setDate(LocalDate.now());
        trip.setStatus(TripStatus.SCHEDULED);
        trip.setDriver(driver);
        trip.setTotalAmount(100.0);
        trip.setDistanceKm(50.0);
        trip.setTaxByKM(1.5);
        trip.setDurationMinutes(60.0);

        assertEquals(1L, trip.getId());
        assertEquals(TripStatus.SCHEDULED, trip.getStatus());
        assertEquals("Motorista", trip.getDriver().getName());
        assertEquals(100.0, trip.getTotalAmount());
        assertEquals(50.0, trip.getDistanceKm());
        assertEquals(1.5, trip.getTaxByKM());
        assertEquals(60.0, trip.getDurationMinutes());
    }

    // rating

    @Test
    void rating_prePersist_setsCreatedAt_whenNull() {
        Rating rating = new Rating();
        rating.setCreatedAt(null);
        rating.prePersist();
        assertNotNull(rating.getCreatedAt());
    }

    @Test
    void rating_prePersist_doesNotOverwrite_whenAlreadySet() {
        Rating rating = new Rating();
        LocalDateTime existing = LocalDateTime.of(2024, 1, 1, 0, 0);
        rating.setCreatedAt(existing);
        rating.prePersist();
        assertEquals(existing, rating.getCreatedAt());
    }

    @Test
    void rating_settersAndGetters() {
        Trip trip = new Trip();
        Driver driver = new Driver();
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        Rating rating = new Rating();
        rating.setId(1L);
        rating.setTrip(trip);
        rating.setDriver(driver);
        rating.setPassenger(passenger);
        rating.setScore(5);
        rating.setComment("Ótimo!");
        rating.setStatus(com.vanvan.enums.RatingStatus.VISIBLE);
        rating.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, rating.getId());
        assertEquals(trip, rating.getTrip());
        assertEquals(driver, rating.getDriver());
        assertEquals(passenger, rating.getPassenger());
        assertEquals(5, rating.getScore());
        assertEquals("Ótimo!", rating.getComment());
        assertEquals(com.vanvan.enums.RatingStatus.VISIBLE, rating.getStatus());
        assertNotNull(rating.getCreatedAt());
    }

    // passenger

    @Test
    void passenger_addTrip() {
        Trip trip = new Trip();
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        passenger.addTrip(trip);

        assertTrue(passenger.getTrips().contains(trip));
        assertTrue(trip.getPassengers().contains(passenger));
    }

    @Test
    void passenger_removeTrip() {
        Trip trip = new Trip();
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        passenger.addTrip(trip);
        passenger.removeTrip(trip);

        assertFalse(passenger.getTrips().contains(trip));
        assertFalse(trip.getPassengers().contains(passenger));
    }

    @Test
    void passenger_getTrips_returnsList() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        assertNotNull(passenger.getTrips());
        assertTrue(passenger.getTrips().isEmpty());
    }

    // user

    @Test
    void user_getAuthorities_driver() {
        Driver driver = new Driver("João", "52998224725", "11999999999",
                "joao@email.com", "senha", "12345678900", "pix", LocalDate.of(1990, 1, 1));

        var authorities = driver.getAuthorities();
        assertTrue(authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER")));
    }

    @Test
    void user_getAuthorities_passenger() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));

        var authorities = passenger.getAuthorities();
        assertTrue(authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PASSENGER")));
    }

    @Test
    void user_getAuthorities_admin() {
        Administrator admin = new Administrator("Admin", "52998224725", "11999999999",
                "admin@email.com", "senha", LocalDate.of(1985, 1, 1));

        var authorities = admin.getAuthorities();
        assertTrue(authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void user_isEnabled_activeTrue() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        passenger.setActive(true);
        assertTrue(passenger.isEnabled());
    }

    @Test
    void user_isEnabled_activeFalse() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        passenger.setActive(false);
        assertFalse(passenger.isEnabled());
    }

    @Test
    void user_accountNonExpired_alwaysTrue() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        assertTrue(passenger.isAccountNonExpired());
    }

    @Test
    void user_accountNonLocked_alwaysTrue() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        assertTrue(passenger.isAccountNonLocked());
    }

    @Test
    void user_credentialsNonExpired_alwaysTrue() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        assertTrue(passenger.isCredentialsNonExpired());
    }

    @Test
    void user_getUsername_returnsEmail() {
        Passenger passenger = new Passenger("Alice", "52998224725", "11999999999",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        assertEquals("alice@email.com", passenger.getUsername());
    }

    @Test
    void user_settersAndGetters() {
        Passenger passenger = new Passenger();
        passenger.setName("Bob");
        passenger.setEmail("bob@email.com");
        passenger.setCpf("61517247047");
        passenger.setPhone("11988888888");
        passenger.setRole(UserRole.PASSENGER);
        passenger.setBirthDate(LocalDate.of(1995, 5, 5));

        assertEquals("Bob", passenger.getName());
        assertEquals("bob@email.com", passenger.getEmail());
        assertEquals("61517247047", passenger.getCpf());
        assertEquals(UserRole.PASSENGER, passenger.getRole());
    }

    // tripstatus enum 

    @Test
    void tripStatus_allValues() {
        TripStatus[] values = TripStatus.values();
        assertTrue(values.length > 0);
        assertEquals(TripStatus.SCHEDULED, TripStatus.valueOf("SCHEDULED"));
        assertEquals(TripStatus.IN_PROGRESS, TripStatus.valueOf("IN_PROGRESS"));
        assertEquals(TripStatus.COMPLETED, TripStatus.valueOf("COMPLETED"));
        assertEquals(TripStatus.CANCELLED, TripStatus.valueOf("CANCELLED"));
    }

    // location

    @Test
    void location_settersAndGetters() {
        Location location = new Location();
        location.setCity("Caruaru");
        location.setStreet("Rua A");
        location.setReferencePoint("Perto do mercado");

        assertEquals("Caruaru", location.getCity());
        assertEquals("Rua A", location.getStreet());
        assertEquals("Perto do mercado", location.getReferencePoint());
    }

    @Test
    void location_allArgsConstructor() {
        Location location = new Location("Garanhuns", "Av B", "Centro");
        assertEquals("Garanhuns", location.getCity());
        assertEquals("Av B", location.getStreet());
        assertEquals("Centro", location.getReferencePoint());
    }

    // driver

    @Test
    void driver_defaultRegistrationStatus_isPending() {
        Driver driver = new Driver();
        assertEquals(com.vanvan.enums.RegistrationStatus.PENDING,
                driver.getRegistrationStatus());
    }

    @Test
    void driver_settersAndGetters() {
        Driver driver = new Driver();
        driver.setName("João");
        driver.setCnh("12345678900");
        driver.setPixKey("pix@email.com");
        driver.setRejectionReason("Documento inválido");
        driver.setRegistrationStatus(com.vanvan.enums.RegistrationStatus.REJECTED);

        assertEquals("João", driver.getName());
        assertEquals("12345678900", driver.getCnh());
        assertEquals("pix@email.com", driver.getPixKey());
        assertEquals("Documento inválido", driver.getRejectionReason());
        assertEquals(com.vanvan.enums.RegistrationStatus.REJECTED,
                driver.getRegistrationStatus());
    }
}