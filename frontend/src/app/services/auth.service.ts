import {afterNextRender, Injectable, signal} from '@angular/core';
import { Router } from '@angular/router';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Observable, map, firstValueFrom } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  registrationStatus?: string; // PENDING | APPROVED | REJECTED (drivers only)
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'auth_role';
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly USER_API_URL = `${environment.apiUrl}/api/user`;

  currentUser = signal<UserProfile | null>(null);

  constructor(private router: Router, private http: HttpClient) {
    afterNextRender(() => {
      const token = this.getToken();
      if (token) {
        this.fetchMe();
      }
    });
  }

  register(data: any): Observable<any> {
    // PARA SE CADASTRAR COMO ADMIN INCLUIR "admin" NO EMAIL, EX: admin@email.com (TEMPORÁRIO, APENAS PARA TESTES)
    const isAdmin = data.email && data.email.toLowerCase().includes('admin');

    let role = 'passenger';
    if (isAdmin) role = 'admin';

    // Map frontend fields (telephone) to backend (phone) and add role
    // Strip mask characters from phone: (11)98765-4321 -> 11987654321
    const rawPhone = data.telephone ? data.telephone.replace(/\D/g, '') : '';
    const finalRole = data.role || role;

    const payload: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      cpf: data.cpf,
      phone: rawPhone,
      birthDate: data.birthDate,
      role: finalRole
    };

    // Include driver-specific fields when registering a driver
    if (finalRole === 'driver') {
      payload.cnh = data.cnh;
      payload.pixKey = data.pixKey;
    }

    return this.http.post(`${this.API_URL}/register`, payload);
  }

  /**
   * Registra um motorista com veículo usando multipart/form-data.
   * @param driverData Dados do motorista
   * @param vehicleDocument Documento PDF do veículo (obrigatório)
   * @param vehiclePhoto Foto do veículo (opcional)
   */
  registerDriverWithVehicle(
    driverData: any,
    vehicleDocument: File,
    vehiclePhoto?: File
  ): Observable<any> {
    const rawPhone = driverData.telephone ? driverData.telephone.replace(/\D/g, '') : '';

    const driverPayload = {
      name: driverData.name,
      email: driverData.email,
      password: driverData.password,
      cpf: driverData.cpf,
      phone: rawPhone,
      birthDate: driverData.birthDate,
      role: 'driver',
      cnh: driverData.cnh,
      pixKey: driverData.pixKey,
      vehicleModelName: driverData.vehicleModelName,
      vehicleLicensePlate: driverData.vehicleLicensePlate
    };

    const formData = new FormData();
    formData.append('driver', JSON.stringify(driverPayload));
    formData.append('vehicleDocument', vehicleDocument);

    if (vehiclePhoto) {
      formData.append('vehiclePhoto', vehiclePhoto);
    }

    return this.http.post(`${this.API_URL}/register-driver`, formData);
  }

  login(email: string, pass: string): Observable<{token: string, role: string}> {
    return this.http.post<{token: string}>(`${this.API_URL}/login`, { email, password: pass }).pipe(
      tap(response => {
        // Store token first so getMe() can use it via interceptor
        this.setSession(response.token, 'client');
      }),
      switchMap(response => this.getMe().pipe(
        tap(profile => this.currentUser.set(profile)),
        map(profile => {
          // Use the real role from the backend profile
          const role = profile.role?.toLowerCase() === 'admin' ? 'admin'
            : profile.role?.toLowerCase() === 'driver' ? 'driver'
            : 'client';
          this.setSession(response.token, role);
          return { token: response.token, role };
        })
      ))
    );
  }

  /** Fetch the authenticated user's profile from backend */
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.USER_API_URL}/me`);
  }

  /** Fire-and-forget profile fetch for constructor/startup */
  private fetchMe(): void {
    this.getMe().subscribe({
      next: (profile) => this.currentUser.set(profile),
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao buscar usuário:', err);

        // PROTEÇÃO: Só apaga o token se for erro de Autenticação.
        // Se for erro de rede (0) ou erro de servidor (500), mantemos o token
        // para o usuário tentar dar F5 de novo.
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRole(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.ROLE_KEY);
    }
    return null;
  }

  private setSession(token: string, role: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.ROLE_KEY, role);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
