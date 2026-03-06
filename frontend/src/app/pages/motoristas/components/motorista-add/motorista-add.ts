import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { AdminService } from '../../../../services/admin.service';
import { ToastService } from '../../../../components/toast/toast.service';
import { Toast } from '../../../../components/toast/toast';

@Component({
  selector: 'app-motorista-add',
  standalone: true,
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './motorista-add.html',
})
export class MotoristaAdd {

  @Output() aoFechar = new EventEmitter<boolean>();

  mostrarSenha = false;
  carregando = signal(false);

  novoMotorista = {
    name: '',
    email: '',
    password: '',
    cpf: '',
    telephone: '',
    birthDate: '',
    cnh: '',
    pixKey: '',
    vehicleModelName: '',
    vehicleLicensePlate: '',
  };

  // Vehicle files
  vehicleDocument: File | null = null;
  vehicleDocumentName = '';
  vehiclePhoto: File | null = null;
  vehiclePhotoName = '';
  licensePlateError = '';

  // Regex para placa Mercosul: 3 letras + 1 número + 1 letra + 2 números
  private readonly LICENSE_PLATE_REGEX = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private toastService: ToastService,
  ) {}

  alternarVisualizacaoSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  onCpfInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    this.novoMotorista.cpf = value;
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

    this.novoMotorista.telephone = value;
    input.value = value;
  }

  onCnhInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    this.novoMotorista.cnh = value;
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

    this.novoMotorista.birthDate = value;
    input.value = value;
  }

  onLicensePlateInput(event: any) {
    const input = event.target as HTMLInputElement;
    // Remove caracteres não alfanuméricos e converte para maiúsculas
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (value.length > 7) value = value.slice(0, 7);

    this.novoMotorista.vehicleLicensePlate = value;
    input.value = value;

    // Valida o formato Mercosul em tempo real
    if (value.length === 7) {
      if (!this.LICENSE_PLATE_REGEX.test(value)) {
        this.licensePlateError = 'Formato inválido. Use: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)';
      } else {
        this.licensePlateError = '';
      }
    } else if (value.length > 0) {
      this.licensePlateError = 'A placa deve ter 7 caracteres';
    } else {
      this.licensePlateError = '';
    }
  }

  onDocumentChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Valida tipo de arquivo
      if (file.type !== 'application/pdf') {
        this.toastService.error('O documento do veículo deve ser um arquivo PDF');
        event.target.value = '';
        return;
      }
      // Valida tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.error('O arquivo excede o tamanho máximo de 10MB');
        event.target.value = '';
        return;
      }
      this.vehicleDocument = file;
      this.vehicleDocumentName = file.name;
    }
  }

  onPhotoChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Valida tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('A foto do veículo deve ser uma imagem JPG, JPEG ou PNG');
        event.target.value = '';
        return;
      }
      // Valida tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.error('O arquivo excede o tamanho máximo de 10MB');
        event.target.value = '';
        return;
      }
      this.vehiclePhoto = file;
      this.vehiclePhotoName = file.name;
    }
  }

  fechar() {
    this.aoFechar.emit(false);
  }

  salvar() {
    const d = this.novoMotorista;

    // Validações básicas
    if (!d.name || !d.email || !d.password || !d.cpf || !d.telephone || !d.birthDate || !d.cnh || !d.pixKey) {
      this.toastService.error('Preencha todos os campos obrigatórios do motorista.');
      return;
    }

    if (d.cpf.length !== 11) {
      this.toastService.error('O CPF deve ter exatamente 11 dígitos.');
      return;
    }

    if (d.cnh.length !== 11) {
      this.toastService.error('A CNH deve ter exatamente 11 dígitos.');
      return;
    }

    const dateParts = d.birthDate.split('/');
    if (dateParts.length !== 3 || dateParts[2].length !== 4) {
      this.toastService.error('Data de nascimento inválida. Use o formato dd/mm/aaaa.');
      return;
    }

    const year = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[0], 10);
    if (year < 1920 || year > 2020 || month < 1 || month > 12 || day < 1 || day > 31) {
      this.toastService.error('Data de nascimento inválida.');
      return;
    }

    // Validações do veículo
    if (!d.vehicleModelName || d.vehicleModelName.trim() === '') {
      this.toastService.error('O modelo do veículo é obrigatório.');
      return;
    }

    if (!d.vehicleLicensePlate || d.vehicleLicensePlate.length !== 7) {
      this.toastService.error('A placa do veículo deve ter 7 caracteres.');
      return;
    }

    if (!this.LICENSE_PLATE_REGEX.test(d.vehicleLicensePlate)) {
      this.toastService.error('Formato de placa inválido. Use: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)');
      return;
    }

    if (!this.vehicleDocument) {
      this.toastService.error('O documento do veículo (PDF) é obrigatório.');
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
      cnh: d.cnh,
      pixKey: d.pixKey,
      role: 'driver',
      vehicleModelName: d.vehicleModelName,
      vehicleLicensePlate: d.vehicleLicensePlate,
    };

    // Usa o método registerDriverWithVehicle que aceita arquivos
    this.authService.registerDriverWithVehicle(
      payload,
      this.vehicleDocument!,
      this.vehiclePhoto || undefined
    ).subscribe({
      next: (res: any) => {
        const driverId = res?.driver?.id;
        if (driverId) {
          // Aprovar automaticamente o motorista após cadastro
          this.adminService.updateDriverStatus(driverId, 'APPROVED').subscribe({
            next: () => {
              this.carregando.set(false);
              this.toastService.success('Motorista e veículo cadastrados com sucesso!');
              this.aoFechar.emit(true);
            },
            error: () => {
              this.carregando.set(false);
              this.toastService.success('Motorista e veículo cadastrados! Aprovação pendente.');
              this.aoFechar.emit(true);
            }
          });
        } else {
          this.carregando.set(false);
          this.toastService.success('Motorista e veículo cadastrados com sucesso!');
          this.aoFechar.emit(true);
        }
      },
      error: (err: any) => {
        this.carregando.set(false);
        if (err?.error?.message) {
          this.toastService.error(err.error.message);
        } else if (typeof err?.error === 'string') {
          this.toastService.error(err.error);
        } else {
          this.toastService.error('Erro ao cadastrar motorista. Verifique os dados e tente novamente.');
        }
      }
    });
  }
}
