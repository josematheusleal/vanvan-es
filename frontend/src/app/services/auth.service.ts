import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'auth_role';
  private readonly API_URL = 'http://localhost:8080/api/auth';
  
  // Mock user for testing without backend
  currentUser = signal<{email: string, role: string} | null>(null);

  constructor(private router: Router, private http: HttpClient) {
    // Check if token exists on startup
    if (this.getToken()) {
      const email = 'user@example.com'; // In a real app we'd decode the token
      const role = this.getRole() || 'client';
      this.currentUser.set({ email, role });
    }
  }

  register(data: any): Observable<any> {
    // Determine role based on email if not present, default to passenger/client
    const isAdmin = data.email && data.email.toLowerCase().includes('admin');
    const role = isAdmin ? 'admin' : 'passenger';
    
    // Map frontend fields (telephone) to backend (phone) and add role
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      cpf: data.cpf,
      phone: data.telephone, 
      role: role
    };
    
    return this.http.post(`${this.API_URL}/register`, payload);
  }

  login(email: string, pass: string): Observable<{token: string, role: string}> {
    return this.http.post<{token: string}>(`${this.API_URL}/login`, { email, password: pass }).pipe(
      map(response => {
        // Backend only returns token, so we deduce role from email as per instructions
        const isAdmin = email.toLowerCase().includes('admin');
        const role = isAdmin ? 'admin' : 'client';
        return { token: response.token, role };
      }),
      tap(res => {
        this.setSession(res.token, res.role);
        this.currentUser.set({ email, role: res.role });
      })
    );
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
