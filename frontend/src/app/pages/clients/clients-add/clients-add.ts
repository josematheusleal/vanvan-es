import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../components/toast/toast.service';

@Component({
  selector: 'app-cliente-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-add.html',
})
export class ClienteAddComponent {

  @Output() aoFechar = new EventEmitter<boolean>();

  mostrarSenha = false;
  carregando = signal(false);

  novoCliente = {
    name: '',
    email: '',
    password: '',
    cpf: '',
    telephone: '',
    birthDate: ''
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  alternarVisualizacaoSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  onCpfInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (value.length > 11) value = value.slice(0, 11);
    this.novoCliente.cpf = value;
    input.value = value;
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1)$2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1)$2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1)$2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }

    this.novoCliente.telephone = value;
    input.value = value;
  }

  onBirthdateInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 4) {
      value = value.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
    }

    this.novoCliente.birthDate = value;
    input.value = value;
  }

  fechar() {
    this.aoFechar.emit(false);
  }

  salvar() {
    const d = this.novoCliente;

    // Validações de campos vazios
    if (!d.name || !d.email || !d.password || !d.cpf || !d.telephone || !d.birthDate) {
      this.toastService.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação do tamanho do CPF
    if (d.cpf.length !== 11) {
      this.toastService.error('O CPF deve ter exatamente 11 dígitos.');
      return;
    }

    // Validação da data
    const dateParts = d.birthDate.split('/');
    if (dateParts.length !== 3 || dateParts[2].length !== 4) {
      this.toastService.error('Data de nascimento inválida. Use o formato dd/mm/aaaa.');
      return;
    }

    const year = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[0], 10);
    if (year < 1920 || year > new Date().getFullYear() || month < 1 || month > 12 || day < 1 || day > 31) {
      this.toastService.error('Data de nascimento inválida.');
      return;
    }

    this.carregando.set(true);

    const payload = {
      name: d.name,
      email: d.email,
      password: d.password,
      cpf: d.cpf,
      telephone: d.telephone,
      birthDate: d.birthDate,
      role: 'passenger', 
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.toastService.success('Cliente cadastrado com sucesso!');
        this.aoFechar.emit(true); // Fecha o modal e avisa o pai para recarregar a lista
      },
      error: (err: any) => {
        this.carregando.set(false);
        if (err?.error?.message) {
          this.toastService.error(err.error.message);
        } else if (typeof err?.error === 'string') {
          this.toastService.error(err.error);
        } else {
          this.toastService.error('Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
        }
      }
    });
  }
}