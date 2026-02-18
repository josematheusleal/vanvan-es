import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map, firstValueFrom } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

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
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly USER_API_URL = 'http://localhost:8080/api/user';

  currentUser = signal<UserProfile | null>(null);

  constructor(private router: Router, private http: HttpClient) {
    // If token exists, fetch the real user profile from backend
    if (this.getToken()) {
      this.fetchMe();
    }
  }

  register(data: any): Observable<any> {
    // Determine role: use explicit role from data, detect admin by email, or default to passenger
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
      error: () => {
        // Token expired or invalid — clear session
        this.logout();
      }
    });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
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
