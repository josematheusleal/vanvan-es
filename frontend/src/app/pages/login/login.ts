import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onLogin(): void {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('E-mail ou senha incorretos.');
        } else if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else if (typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else {
           this.errorMessage.set('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        }
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
