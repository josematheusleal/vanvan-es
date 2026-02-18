import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-driver-2',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-driver-2.html',
})
export class RegisterDriverTwo {
  // Campos do formulário (Step 2)
  cnh = '';
  chavePix = '';
  vehicle = '';
  licensePlate = '';
  birthdate = '';
  
  // Variável para feedback de erro
  errorMessage = '';

  // Dados vindos da Etapa 1
  private dadosEtapa1: any = {};

    constructor(
        private router: Router,
        private authService: AuthService,
    ) {
        const nav = this.router.getCurrentNavigation();
        if (nav?.extras.state) {
            this.dadosEtapa1 = nav.extras.state['driver'];
        } else { 
            this.router.navigate(['/register-driver-1']);
        }
    }

    onCnhInput(event: any) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        this.cnh = value;
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

    // Método chamado pelo botão "Cadastrar"
    finalizarCadastro() {
        // 1. Validação simples
        if (!this.cnh || !this.chavePix || !this.birthdate) {
            this.errorMessage = 'Preencha todos os campos obrigatórios (CNH, Chave PIX e Data de nascimento).';
            return;
        }

        if (this.cnh.length !== 11) {
            this.errorMessage = 'A CNH deve ter exatamente 11 dígitos.';
            return;
        }

        // Validate Birthdate
        const dateParts = this.birthdate.split('/');
        if (dateParts.length !== 3) {
            this.errorMessage = 'Data de nascimento inválida. Use o formato dd/mm/aaaa.';
            return;
        }
        
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        
        if (year < 1920 || year > 2020) {
            this.errorMessage = 'O ano de nascimento deve ser entre 1920 e 2020.';
            return;
        }
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            this.errorMessage = 'Data de nascimento inválida.';
            return;
        }

        this.errorMessage = '';

        // 2. Montar o objeto final (Juntando Step 1 + Step 2)
        // dadosEtapa1 has: name, email, cpf, telephone, password
        const motoristaCompleto = {
            name: this.dadosEtapa1.name,
            email: this.dadosEtapa1.email,
            cpf: this.dadosEtapa1.cpf,
            telephone: this.dadosEtapa1.telephone,
            password: this.dadosEtapa1.password,
            cnh: this.cnh,
            pixKey: this.chavePix,
            birthDate: this.birthdate,
            role: 'driver',
            // Campos extras (não usados no backend por ora)
            vehicle: this.vehicle,
            licensePlate: this.licensePlate,
        };

        console.log('Enviando para API:', motoristaCompleto);

        this.authService.register(motoristaCompleto).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Erro no cadastro do motorista:', err);
                if (err.error && typeof err.error === 'object' && err.error.message) {
                    this.errorMessage = err.error.message;
                } else if (typeof err.error === 'string') {
                    this.errorMessage = err.error;
                } else {
                    this.errorMessage = 'Falha ao realizar cadastro. Verifique os dados e tente novamente.';
                }
            }
        });
    }
}