import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-driver-1',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-driver-1.html',
})
export class RegisterDriverOne {
  name = '';
  email = '';
  cpf = '';
  telephone = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);

  constructor(private router: Router) {}

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

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onRegister(): void {
    // 1. Validação Básica
    if (!this.name || !this.email || !this.password || !this.cpf || !this.telephone) {
      alert('Por favor, preencha todos os campos antes de continuar.');
      return;
    }
    
    // 2. Prepara o objeto com os dados desta etapa
    const dadosEtapa1 = {
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      telephone: this.telephone, 
      password: this.password
    };

    console.log('Indo para etapa 2 com:', dadosEtapa1);

    // 3. Navega para a rota da Etapa 2 enviando os dados no "state"
    this.router.navigate(['/register-driver-2'], { 
      state: { driver: dadosEtapa1 } 
    });
  }
}
