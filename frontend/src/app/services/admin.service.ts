import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DriverAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnh: string;
  birthDate: string;
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
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
  private readonly API_URL = 'http://localhost:8080/api/admin';

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
}
