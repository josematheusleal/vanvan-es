import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  mes: string;
  dia: string;
  horario: string;
  vagas: number;
  preco: number;
  distancia: number;
  localPartida: string;
  pontoReferencia: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  motoristaNome: string;
  motoristaNota: string;
  imagemVeiculo: string;
}

@Component({
  selector: 'app-buscar-viagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-trips.html'
})
export class SearchTripsComponent {
  
  
  viagens: Viagem[] = [
    {
      id: 1,
      origem: 'Garanhuns',
      destino: 'Recife',
      mes: 'FEV',
      dia: '10',
      horario: '08:00',
      vagas: 15,
      preco: 40.00,
      distancia: 60,
      localPartida: 'Rodoviária de Garanhuns',
      pontoReferencia: 'Próximo ao guichê principal',
      veiculoModelo: 'Mercedes-Benz Sprinter 2020',
      veiculoPlaca: 'ABC-123',
      motoristaNome: 'Carlos Silva',
      motoristaNota: '4,8',
      imagemVeiculo: 'https://placehold.co/225x118'
    },
    {
      id: 2,
      origem: 'Garanhuns',
      destino: 'Recife',
      mes: 'FEV',
      dia: '10',
      horario: '14:30',
      vagas: 4,
      preco: 40.00,
      distancia: 60,
      localPartida: 'Praça Mestre Dominguinhos',
      pontoReferencia: 'Em frente ao relógio',
      veiculoModelo: 'Renault Master 2022',
      veiculoPlaca: 'XYZ-987',
      motoristaNome: 'Ana Souza',
      motoristaNota: '5,0',
      imagemVeiculo: 'https://placehold.co/225x118'
    }
  ];

  // ==========================================
  // CONTROLE DOS MODAIS E PAGAMENTO
  // ==========================================

  showConfirmModal = false;
  showPaymentModal = false;

  viagemSelecionada: any = {}; 

  // Código PIX falso para demonstração
  codigoPix = 'pix-de-exemplo-123456789';

  // ==========================================
  // FUNÇÕES DOS MODAIS
  // ==========================================

  selecionarViagem(viagem: any) {
    this.viagemSelecionada = viagem;
    this.showConfirmModal = true; 
  }

 
  fecharModalConfirmacao() {
    this.showConfirmModal = false;
  }

  fazerPagamento() {
    this.showConfirmModal = false; 
    this.showPaymentModal = true;  
  }


  fecharModalPagamento() {
    this.showPaymentModal = false;
    this.viagemSelecionada = {}; 
  }
}