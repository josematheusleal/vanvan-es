import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../components/toast/toast.service';

@Component({
  selector: 'app-register-driver-2',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-driver-2.html',
})
export class RegisterDriverTwo {
  cnh = '';
  chavePix = '';
  vehicle = '';
  licensePlate = '';
  licensePlateError = '';

  // Arquivos do veículo
  vehicleDocument: File | null = null;
  vehicleDocumentName = '';
  vehiclePhoto: File | null = null;
  vehiclePhotoName = '';

  // Regex para placa Mercosul: 3 letras + 1 número + 1 letra + 2 números
  private readonly LICENSE_PLATE_REGEX = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

  errorMessage = '';

  private dadosEtapa1: any = {};

    constructor(
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService // Serviço injetado aqui
    ) {
        const nav = this.router.getCurrentNavigation();
        if (nav?.extras.state) {
            this.dadosEtapa1 = nav.extras.state['driver'];
            // Garantir que birthdate seja propagado, embora esteja em dadosEtapa1
            console.log('Dados recebidos da etapa 1:', this.dadosEtapa1);
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

    onLicensePlateInput(event: any) {
        const input = event.target as HTMLInputElement;
        // Remove caracteres não alfanuméricos e converte para maiúsculas
        let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        if (value.length > 7) value = value.slice(0, 7);

        this.licensePlate = value;
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

    finalizarCadastro() {
        if (!this.cnh || !this.chavePix) {
            this.toastService.error('Preencha todos os campos obrigatórios (CNH, Chave PIX).');
            return;
        }

        if (this.cnh.length !== 11) {
            this.toastService.error('A CNH deve ter exatamente 11 dígitos.');
            return;
        }

        // Validação do veículo
        if (!this.vehicle || this.vehicle.trim() === '') {
            this.toastService.error('O modelo do veículo é obrigatório.');
            return;
        }

        // Validação da placa
        if (!this.licensePlate || this.licensePlate.length !== 7) {
            this.toastService.error('A placa do veículo deve ter 7 caracteres.');
            return;
        }

        if (!this.LICENSE_PLATE_REGEX.test(this.licensePlate)) {
            this.toastService.error('Formato de placa inválido. Use: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)');
            return;
        }

        // Validação do documento do veículo
        if (!this.vehicleDocument) {
            this.toastService.error('O documento do veículo (PDF) é obrigatório.');
            return;
        }

        if (!this.dadosEtapa1.birthDate) {
             this.toastService.error('Erro nos dados da etapa anterior. Por favor, volte e preencha a data de nascimento.');
             return;
        }

        this.errorMessage = '';

        const motoristaCompleto = {
            name: this.dadosEtapa1.name,
            email: this.dadosEtapa1.email,
            cpf: this.dadosEtapa1.cpf,
            telephone: this.dadosEtapa1.telephone,
            password: this.dadosEtapa1.password,
            cnh: this.cnh,
            pixKey: this.chavePix,
            birthDate: this.dadosEtapa1.birthDate,
            role: 'driver',
            vehicleModelName: this.vehicle,
            vehicleLicensePlate: this.licensePlate,
        };

        console.log('Enviando para API:', motoristaCompleto);

        // Usa o novo método que envia arquivos
        this.authService.registerDriverWithVehicle(
            motoristaCompleto,
            this.vehicleDocument!,
            this.vehiclePhoto || undefined
        ).subscribe({
            next: () => {
                this.toastService.success('Motorista cadastrado, aguarde a aprovação do administrador!');
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Erro no cadastro do motorista:', err);
                let msgErro = 'Falha ao realizar cadastro. Verifique os dados e tente novamente.';

                if (err.error && typeof err.error === 'object' && err.error.message) {
                    msgErro = err.error.message;
                } else if (typeof err.error === 'string') {
                    msgErro = err.error;
                }

                this.errorMessage = msgErro;
                this.toastService.error(msgErro); // Dispara o Toast com o erro da API
            }
        });
    }
}
