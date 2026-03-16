import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.model';

export interface TripHistoryDTO {
  id: number;
  date: string;
  time: string;
  departureCity: string;
  arrivalCity: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  route: string;
  driverName: string;
  passengerCount: number;
  totalSeats: number;
  availableSeats: number;
  totalAmount: number;
}

export interface TripDetailsDTO {
  id: number;
  date: string;
  time: string;
  departureCity: string;
  departureStreet: string;
  departureReferencePoint: string;
  arrivalCity: string;
  arrivalStreet: string;
  arrivalReferencePoint: string;
  distanceKm: number;
  durationMinutes: number;
  taxBykm: number;
  totalAmount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverName: string;
  vehicleModel: string;
  vehiclePlate: string;
  availableSeats: number;
  totalSeats: number;
  passengers: PassengerDTO[];
}

export interface PassengerDTO {
  id: string;
  name: string;
  phone: string;
}

export interface LocationDTO {
  city: string;
  street: string;
  reference: string;
}

export interface CreateTripDTO {
  date: string;
  time: string;
  departure: LocationDTO;
  arrival: LocationDTO;
  passengerIds: string[];
  driverId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalSeats: number;
  perKmRate?: number;
  vehicleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly apiUrl = `${environment.apiUrl}/api/trips`;

  constructor(private http: HttpClient) {}

  // =====================
  // DRIVER AND ADMIN ENDPOINTS
  // =====================

  createTrip(tripData: CreateTripDTO): Observable<TripDetailsDTO> {
    return this.http.post<TripDetailsDTO>(`${this.apiUrl}/create`, tripData);
  }

  updateTripStatus(tripId: number, status: string): Observable<TripDetailsDTO> {
    return this.http.patch<TripDetailsDTO>(`${this.apiUrl}/${tripId}/status`, { status });
  }

  // =====================
  // PASSENGER ENDPOINTS
  // =====================

  bookTrip(tripId: number): Observable<TripDetailsDTO> {
    return this.http.post<TripDetailsDTO>(`${this.apiUrl}/${tripId}/book`, {});
  }

  cancelBooking(tripId: number): Observable<TripDetailsDTO> {
    return this.http.post<TripDetailsDTO>(`${this.apiUrl}/${tripId}/cancel-booking`, {});
  }

  searchTrips(
    date?: string,
    departureCity?: string,
    arrivalCity?: string,
    passengerCount?: number,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<TripHistoryDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (date) params = params.set('date', date);
    if (departureCity) params = params.set('departureCity', departureCity);
    if (arrivalCity) params = params.set('arrivalCity', arrivalCity);
    if (passengerCount) params = params.set('passengerCount', passengerCount.toString());

    return this.http.get<PageResponse<TripHistoryDTO>>(`${this.apiUrl}/search`, { params });
  }

  // =====================
  // SHARED ENDPOINTS
  // =====================

  getTripHistory(
    startDate?: string,
    endDate?: string,
    driverId?: string,
    departureCity?: string,
    arrivalCity?: string,
    status?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<TripHistoryDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (driverId) params = params.set('driverId', driverId);
    if (departureCity) params = params.set('departureCity', departureCity);
    if (arrivalCity) params = params.set('arrivalCity', arrivalCity);
    if (status) params = params.set('status', status);

    return this.http.get<PageResponse<TripHistoryDTO>>(`${this.apiUrl}/history`, { params });
  }

  getTripDetails(tripId: number): Observable<TripDetailsDTO> {
    return this.http.get<TripDetailsDTO>(`${this.apiUrl}/${tripId}`);
  }
}
