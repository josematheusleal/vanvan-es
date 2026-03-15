package com.vanvan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.exception.InvalidValueException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Retorna as coordenadas de uma cidade.
     * Lança IllegalArgumentException se a cidade não for encontrada.
     *
     * @param cityName nome da cidade (ex: "Recife, PE")
     * @return array double[]{latitude, longitude}
     */
    public double[] getCoordinates(String cityName) {
        String url = UriComponentsBuilder.fromUriString(NOMINATIM_URL)
                .queryParam("q", cityName)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .queryParam("countrycodes", "br") // restringe ao Brasil
                .toUriString();

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode results = objectMapper.readTree(response);

            if (results == null || results.isEmpty()) {
                throw new IllegalArgumentException("Cidade não encontrada no Nominatim: " + cityName);
            }

            JsonNode first = results.get(0);
            double lat = first.get("lat").asDouble();
            double lon = first.get("lon").asDouble();

            log.info("Geocoding '{}' → lat={}, lon={}", cityName, lat, lon);
            return new double[]{lat, lon};

        } catch (Exception _) {
            throw new InvalidValueException("Erro ao consultar Nominatim para cidade: " + cityName);
        }
    }
}
