import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Journey {
  id?: number; // Use string se o seu backend usar UUID
  name: string;
  origin: string;
  destination: string;
}

export interface RateConfig {
  id?: number;
  pricePerKm: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Ajuste a URL base se necessário
  private readonly API_URL = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // --- Endpoints de Trechos (Journeys) ---
  listarTrechos(): Observable<Journey[]> {
    return this.http.get<Journey[]>(`${this.API_URL}/routes`);
  }

  adicionarTrecho(trecho: Journey): Observable<Journey> {
    return this.http.post<Journey>(`${this.API_URL}/routes`, trecho);
  }

  editarTrecho(id: number, trecho: Journey): Observable<Journey> {
    return this.http.put<Journey>(`${this.API_URL}/routes/${id}`, trecho);
  }

  excluirTrecho(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/routes/${id}`);
  }

  // --- Endpoints de Tarifa (Rate) ---
  obterTarifaAtual(): Observable<RateConfig> {
    return this.http.get<RateConfig>(`${this.API_URL}/rates`);
  }

  atualizarTarifa(tarifa: RateConfig): Observable<RateConfig> {
    return this.http.put<RateConfig>(`${this.API_URL}/rates`, tarifa);
  }
}