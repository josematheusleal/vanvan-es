import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, RateConfig } from '../../services/settings.service';

// Modelos espelhando o Backend (DTOs)
export interface PassengerDTO {
  id: string; // UUID
  name: string;
}

export interface TripDetailsDTO {
  id?: number;
  date: string;
  time: string;
  driverName: string;
  passengers: PassengerDTO[];
  departureCity: string;
  arrivalCity: string;
  totalAmount: number;
  status: string;
}

const MOCK_TRIPS: TripDetailsDTO[] = [
  {
    id: 1,
    date: '2026-03-10',
    time: '08:00',
    driverName: 'João Silva',
    departureCity: 'Garanhuns',
    arrivalCity: 'Recife',
    totalAmount: 120.00,
    status: 'CONFIRMED',
    passengers: [
      { id: 'uuid-1', name: 'Maria Souza' },
      { id: 'uuid-2', name: 'Pedro Santos' },
      { id: 'uuid-3', name: 'Ana Beatriz' }
    ]
  },
  {
    id: 2,
    date: '2026-03-11',
    time: '14:30',
    driverName: 'Carlos Oliveira',
    departureCity: 'Recife',
    arrivalCity: 'Caruaru',
    totalAmount: 0.00,
    status: 'PENDING',
    passengers: []
  },
  {
    id: 3,
    date: '2026-03-05',
    time: '09:15',
    driverName: 'Fernanda Lima',
    departureCity: 'Caruaru',
    arrivalCity: 'Garanhuns',
    totalAmount: 200.00,
    status: 'COMPLETED',
    passengers: [
      { id: 'uuid-4', name: 'Lucas Ferreira' },
      { id: 'uuid-5', name: 'Juliana Costa' }
    ]
  },
  {
    id: 4,
    date: '2026-03-12',
    time: '18:00',
    driverName: 'Marcos Antônio',
    departureCity: 'Garanhuns',
    arrivalCity: 'Maceió',
    totalAmount: 40.00,
    status: 'CANCELED',
    passengers: [
      { id: 'uuid-6', name: 'Roberto Carlos' }
    ]
  }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html'
})

export class SettingsComponent implements OnInit {
  searchQuery = '';
  newOrigin = '';
  newDestination = '';
  newRateValue: number = 0;


  currentRate = 0.0;
  distance = 63; // Simulando distância fixa por enquanto

  // Signal contendo as Viagens da API
  private _trips = signal<TripDetailsDTO[]>([]);

  // Variáveis de controle dos modais
  showEditModal = false;
  showDeleteModal = false;
  showPassengersModal = false; // Novo controle do modal de passageiros
  
  selectedTrip: any = null;
  selectedTripPassengers: PassengerDTO[] = []; // Guarda a lista exibida no modal

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    // ---------------------------------------------------------
    // MODO DE TESTE: Atribui os dados falsos diretamente
    this._trips.set(MOCK_TRIPS);
    // ---------------------------------------------------------

    /* QUANDO O BACKEND ESTIVER PRONTO, DESCOMENTE ISTO E APAGUE A LINHA ACIMA:
    this.settingsService.listarTrechos().subscribe({
      next: (dados: any) => this._trips.set(dados),
      error: (err) => console.error('Erro ao carregar viagens', err)
    });
    */

    this.settingsService.obterTarifaAtual().subscribe({
      next: (config) => {
        if (config && config.pricePerKm) {
          this.currentRate = config.pricePerKm;
        }
      },
      error: (err) => console.error('Erro ao carregar tarifa', err)
    });
  }

  // Filtro de pesquisa atualizado
  trips = computed(() => {
    const query = this.searchQuery.toLowerCase();
    return this._trips().filter(t => 
      t.departureCity?.toLowerCase().includes(query) || 
      t.arrivalCity?.toLowerCase().includes(query) ||
      t.driverName?.toLowerCase().includes(query)
    );
  });

  get estimatedValue(): number {
    return this.distance * this.currentRate;
  }

  // --- Modais e Ações da Tabela ---

  addTrip() {
    if (!this.newOrigin || !this.newDestination) {
      alert('Preencha origem e destino!');
      return;
    }
    console.log("Criar viagem de", this.newOrigin, "para", this.newDestination);
    // Aqui no futuro chamará a API para criar nova viagem
  }

  openEditModal(trip: TripDetailsDTO) {
    this.selectedTrip = { ...trip }; 
    this.showEditModal = true;
  }

  openDeleteModal(trip: TripDetailsDTO) {
    this.selectedTrip = trip;
    this.showDeleteModal = true;
  }

  // Nova função para abrir o modal de passageiros
  openPassengersModal(trip: TripDetailsDTO) {
    this.selectedTripPassengers = trip.passengers || [];
    this.showPassengersModal = true;
  }

  // Fecha qualquer modal que estiver aberto
  closeModals() {
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showPassengersModal = false;
    this.selectedTrip = null;
  }

  confirmSaveEdit() {
    // Lógica futura de salvar a edição no backend
    this.closeModals();
  }

  confirmDelete() {
    if (!this.selectedTrip.id) return;

    this.settingsService.excluirTrecho(this.selectedTrip.id).subscribe({
      next: () => {
        this._trips.update(list => list.filter(t => t.id !== this.selectedTrip.id));
        this.closeModals();
      },
      error: () => alert('Erro ao excluir a viagem.')
    });
  }

  saveRate() {
    if (this.newRateValue > 0) {
      const novaConfig: RateConfig = { pricePerKm: this.newRateValue };
      
      this.settingsService.atualizarTarifa(novaConfig).subscribe({
        next: (tarifaSalva) => {
          this.currentRate = tarifaSalva.pricePerKm;
          alert(`Nova tarifa de R$${this.currentRate.toFixed(2)} salva com sucesso!`);
          this.newRateValue = 0;
        },
        error: () => alert('Erro ao salvar a nova tarifa no servidor.')
      });
    } else {
      alert('Insira um valor válido para a tarifa.');
    }
  }
}