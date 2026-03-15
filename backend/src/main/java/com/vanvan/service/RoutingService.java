package com.vanvan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.exception.UnknownErrorException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class RoutingService {

    // API pública do OSRM — driving (carro)
    private static final String OSRM_URL =
            "https://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=false";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Resultado do cálculo de rota.
     *
     * @param distanceKm    distância total em quilômetros
     * @param durationMinutes duração estimada em minutos
     */
    public record RouteResult(double distanceKm, double durationMinutes) {}

    /**
     * Calcula a rota entre origem e destino via OSRM.
     *
     * @param originCoords      double[]{lat, lng} da origem
     * @param destinationCoords double[]{lat, lng} do destino
     * @return RouteResult com distância e duração
     */
    public RouteResult calculateRoute(double[] originCoords, double[] destinationCoords) {
        // OSRM espera longitude,latitude (ordem inversa ao padrão)
        String url = String.format(OSRM_URL,
                originCoords[1], originCoords[0],       // lng,lat origem
                destinationCoords[1], destinationCoords[0] // lng,lat destino
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            String code = root.path("code").asText();
            if (!"Ok".equals(code)) {
                throw new UnknownErrorException("OSRM retornou erro: " + code);
            }

            JsonNode route = root.path("routes").get(0);
            double distanceMeters = route.path("distance").asDouble();
            double durationSeconds = route.path("duration").asDouble();

            double distanceKm = distanceMeters / 1000.0;
            double durationMinutes = durationSeconds / 60.0;

            return new RouteResult(distanceKm, durationMinutes);

        } catch (Exception e) {
            throw new UnknownErrorException("Erro ao consultar OSRM :\n" + e.getMessage());
        }
    }
}
