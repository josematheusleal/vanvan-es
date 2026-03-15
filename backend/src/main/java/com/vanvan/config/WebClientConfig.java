package com.vanvan.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WebClientConfig {

    /**
     * RestTemplate usado pelo GeocodingService e RoutingService.
     * Sem customizações especiais — simples e direto.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
