import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DriverAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnh: string;
  birthDate: string;
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
}

export interface Vehicle {
  id: string;
  modelName: string;
  licensePlate: string;
  documentPath: string;
  photoPath: string | null;
  driverId: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  listClients(undefined: undefined, arg1: number, arg2: number) {
    throw new Error('Method not implemented.');
  }
  private readonly API_URL = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  listDrivers(
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    page = 0,
    size = 10
  ): Observable<PageResponse<DriverAdmin>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<DriverAdmin>>(
      `${this.API_URL}/drivers`,
      { params }
    );
  }

  updateDriverStatus(
    driverId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Observable<DriverAdmin> {
    return this.http.put<DriverAdmin>(
      `${this.API_URL}/drivers/${driverId}/status`,
      { status, rejectionReason }
    );
  }

  updateDriver(
    driverId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      cnh?: string;
      cpf?: string;
      registrationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    }
  ): Observable<DriverAdmin> {
    return this.http.put<DriverAdmin>(
      `${this.API_URL}/drivers/${driverId}`,
      data
    );
  }

  deleteDriver(driverId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/drivers/${driverId}`);
  }

  getDriverVehicles(driverId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.API_URL}/vehicles/driver/${driverId}`);
  }

  getVehicleDocument(vehicleId: string): string {
    return `${environment.apiUrl}/api/vehicles/${vehicleId}/document`;
  }

  getVehiclePhoto(vehicleId: string): string {
    return `${environment.apiUrl}/api/vehicles/${vehicleId}/photo`;
  }

}


