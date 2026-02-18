import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  name = '';
  email = '';
  birthdate = '';
  cpf = '';
  telephone = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private router: Router, private authService: AuthService) {}

  onCpfInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // User requested specifically "input de número de 11 dígitos"
    // and explicitly requested format ONLY for the telephone.
    // So we keep CPF as raw digits, just limited to 11.
    this.cpf = value;
    input.value = value;
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 11 digits (DDD + 9 digits)
    if (value.length > 11) value = value.slice(0, 11);

    // Apply mask (00)00000-0000
    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1)$2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1)$2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1)$2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }

    this.telephone = value;
    input.value = value;
  }

  onBirthdateInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Mask dd/MM/yyyy
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length > 4) {
      value = value.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
    }

    this.birthdate = value;
    input.value = value;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onRegister(): void {
    if (!this.name || !this.email || !this.password || !this.birthdate) {
        this.errorMessage.set('Preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validate Birthdate
    const dateParts = this.birthdate.split('/');
    if (dateParts.length !== 3) {
        this.errorMessage.set('Data de nascimento inválida. Use o formato dd/mm/aaaa.');
        return;
    }
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    
    if (year < 1920 || year > 2020) {
        this.errorMessage.set('O ano de nascimento deve ser entre 1920 e 2020.');
        return;
    }
    
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        this.errorMessage.set('Data de nascimento inválida.');
        return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const data = {
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      telephone: this.telephone,
      password: this.password,
      birthDate: this.birthdate, // Send formatted string dd/MM/yyyy
      // role is determined by AuthService based on email (admin/motorista/passenger)
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else if (typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else {
          this.errorMessage.set('Falha ao realizar cadastro. Verifique os dados e tente novamente.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
