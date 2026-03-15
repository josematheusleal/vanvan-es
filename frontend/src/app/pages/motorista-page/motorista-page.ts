import { Component, OnDestroy, OnInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';
import { RatingService } from '../../services/rating.service';
import { TripService } from '../../services/trip.service';
import { AuthService } from '../../services/auth.service';

type TripStatus = 'none' | 'scheduled' | 'in_progress' | 'arriving' | 'completed';

@Component({
  selector: 'app-motorista-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motorista-page.html',
  styleUrls: ['./motorista-page.css']
})
export class MotoristaPage implements OnInit, OnDestroy {

  driverRating = { averageScore: 0, totalRatings: 0 };
  private tripService = inject(TripService);
  private authService = inject(AuthService);
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private ratingService: RatingService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // 1. Fetch ratings
    this.ratingService.getDriverMediaAvaliacao().subscribe({
      next: (rating) => {
        this.driverRating = rating;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar notas do motorista:', err);
      }
    });

    // 2. Fetch driver active or next trip
    this.fetchDriverNextTrip();

    // 3. Update rate dynamically
    this.authService.getDriverMe().subscribe(user => {
       if (user && user.ratePerKm != null) {
          this.pricing.ratePerKm = `R$${user.ratePerKm.toFixed(2).replace('.', ',')}/km`;
          this.calculateEstimatedPrices(user.ratePerKm);
          this.cdr.detectChanges();
       }
    });
  }

  fetchDriverNextTrip() {
    this.tripService.getTripHistory(undefined, undefined, undefined, undefined, undefined, undefined, 0, 5).subscribe({
      next: (page: any) => {
        // Try finding one in progress
        let activeTrip = page.content.find((t: any) => t.status === 'IN_PROGRESS');
        if (!activeTrip) {
          // If no active trip, grab first scheduled
          activeTrip = page.content.find((t: any) => t.status === 'SCHEDULED');
        }

        if (activeTrip) {
          const dt = new Date(activeTrip.date);
          const day = String(dt.getDate() + 1).padStart(2, '0');
          const monthStr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][dt.getMonth()];
          
          this.currentTrip = {
            id: activeTrip.id,
            availableSeats: activeTrip.availableSeats,
            confirmedPassengers: activeTrip.passengerCount,
            origin: activeTrip.departureCity,
            destination: activeTrip.arrivalCity,
            distance: `0km`,
            distanceNum: 0,
            departureLocation: 'Rodoviária', // Fallback
            arrivalLocation: 'Terminal', // Fallback
            date: `${day} ${monthStr}`,
            time: activeTrip.time,
            pricePerSeat: activeTrip.totalAmount // fallback
          };
          this.tripStatus = activeTrip.status === 'IN_PROGRESS' ? 'in_progress' : 'scheduled';
        } else {
          this.currentTrip = null;
          this.tripStatus = 'none';
        }

        // Set past trips dynamically
        this.pastTrips = page.content
          .filter((t: any) => t.status === 'COMPLETED' || t.status === 'CANCELLED')
          .slice(0, 3)
          .map((trip: any) => {
            const dt = new Date(trip.date);
            const day = String(dt.getDate() + 1).padStart(2, '0');
            const monthStr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][dt.getMonth()];
            
            return {
              origin: trip.departureCity,
              destination: trip.arrivalCity,
              price: `R$${(trip.totalAmount || 0).toFixed(2).replace('.', ',')}`,
              distance: trip.route || '---',
              date: `${day} ${monthStr}`,
              time: trip.time
            };
          });
      },
      error: (err: any) => {
        console.error('Failed fetching driver trip', err);
        this.currentTrip = null;
        this.tripStatus = 'none';
      }
    });
  }


  // ===== Trip Status =====
  tripStatus: TripStatus = 'none'; // Estado padrão silencioso sem mock

  // ===== Timer =====
  elapsedTime = 0; // em segundos
  private timerInterval: any = null;

  // ===== Progress =====
  tripProgress = 0; // 0-100
  estimatedArrival = '';
  distanceTraveled = '0km';
  distanceRemaining = '230km';

  // ===== Current Trip =====
  currentTrip: any = null;

  // ===== Passengers (para viagem em andamento) =====
  passengers = [
    { name: 'Maria Silva', status: 'confirmed', seat: 1 },
    { name: 'João Santos', status: 'confirmed', seat: 2 },
    { name: 'Ana Costa', status: 'confirmed', seat: 3 },
    { name: 'Pedro Lima', status: 'confirmed', seat: 4 },
    { name: 'Carla Souza', status: 'confirmed', seat: 5 },
  ];

  // ===== Quick Actions During Trip =====
  showEmergencyPopup = false;
  showPassengersPopup = false;

  // Seat management
  adjustSeats(delta: number): void {
    if (!this.currentTrip) return;
    const newVal = this.currentTrip.availableSeats + delta;
    if (newVal >= 0) {
      this.currentTrip.availableSeats = newVal;
    }
  }

  saveSeats(): void {
    if (!this.currentTrip) return;
    this.toastService.success('Assentos atualizados com sucesso!');
  }

  cancelCurrentTrip(): void {
    if (!this.currentTrip) return;
    this.updateTripStatusOnBackend('CANCELLED', () => {
       this.resetTrip();
       this.toastService.success('Viagem cancelada com sucesso');
    });
  }

  startTrip(): void {
    if (!this.currentTrip) return;
    this.updateTripStatusOnBackend('IN_PROGRESS', () => {
      this.tripStatus = 'in_progress';
      this.elapsedTime = 0;
      this.tripProgress = 0;
      this.estimatedArrival = this.calculateEstimatedArrival();
      this.distanceTraveled = '0km';
      this.distanceRemaining = this.currentTrip.distance;

      this.toastService.success('Viagem iniciada! Boa viagem!');

      // Iniciar cronômetro
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        this.updateTripProgress();
      }, 1000);
    });
  }

  pauseTrip(): void {
    // Pausar/retomar cronômetro
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    } else {
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        this.updateTripProgress();
      }, 1000);
    }
  }

  finishTrip(): void {
    if (!this.currentTrip) return;
    this.updateTripStatusOnBackend('COMPLETED', () => {
      this.tripStatus = 'completed';
      this.tripProgress = 100;
      this.distanceTraveled = this.currentTrip.distance;
      this.distanceRemaining = '0km';

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.toastService.success('Viagem finalizada com sucesso!');

      // Fetch fresh empty trips again
      setTimeout(() => {
        this.fetchDriverNextTrip();
      }, 3000);
    });
  }

  private calculateEstimatedPrices(rate: number): void {
    const distances = [50, 100, 250];
    this.pricing.routes = distances.map(d => ({
      distance: `${d}km`,
      price: `R$${(d * rate).toFixed(2).replace('.', ',')}`
    }));
  }

  private updateTripStatusOnBackend(status: string, callback: () => void) {
      this.tripService.updateTripStatus(this.currentTrip.id, status).subscribe({
         next: () => callback(),
         error: (err: any) => {
            console.error('Failed to change trip status', err);
            this.toastService.error('Erro na alteração do status da viagem.');
         }
      })
  }

  private resetTrip(): void {
    this.tripStatus = 'scheduled';
    this.currentTrip = null;
    this.elapsedTime = 0;
    this.tripProgress = 0;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTripProgress(): void {
    if (!this.currentTrip) return;

    // Simular progresso baseado no tempo (para demo)
    // Em produção, seria baseado em GPS
    const estimatedTripDuration = 180 * 60; // 3 horas em segundos
    this.tripProgress = Math.min((this.elapsedTime / estimatedTripDuration) * 100, 99);

    // Atualizar distâncias
    const traveled = (this.tripProgress / 100) * this.currentTrip.distanceNum;
    const remaining = this.currentTrip.distanceNum - traveled;
    this.distanceTraveled = `${Math.round(traveled)}km`;
    this.distanceRemaining = `${Math.round(remaining)}km`;

    // Verificar se está chegando (90%+)
    if (this.tripProgress >= 90 && this.tripStatus === 'in_progress') {
      this.tripStatus = 'arriving';
    }
  }

  private calculateEstimatedArrival(): string {
    const now = new Date();
    const arrival = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 horas
    return `${arrival.getHours().toString().padStart(2, '0')}:${arrival.getMinutes().toString().padStart(2, '0')}`;
  }

  get formattedElapsedTime(): string {
    const hours = Math.floor(this.elapsedTime / 3600);
    const minutes = Math.floor((this.elapsedTime % 3600) / 60);
    const seconds = this.elapsedTime % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get isPaused(): boolean {
    return this.timerInterval === null && this.tripStatus === 'in_progress';
  }

  get totalEarnings(): string {
    if (!this.currentTrip) return 'R$0,00';
    const total = this.currentTrip.confirmedPassengers * this.currentTrip.pricePerSeat;
    return `R$${total.toFixed(2).replace('.', ',')}`;
  }

  togglePassengersPopup(): void {
    this.showPassengersPopup = !this.showPassengersPopup;
    this.showEmergencyPopup = false;
  }

  toggleEmergencyPopup(): void {
    this.showEmergencyPopup = !this.showEmergencyPopup;
    this.showPassengersPopup = false;
  }

  callEmergency(): void {
    this.toastService.success('Acionando emergência médica (192)...');
    this.toggleEmergencyPopup();
  }

  reportProblem(): void {
    this.toastService.success('Abrindo formulário de reporte...');
    this.toggleEmergencyPopup();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // ===== Past Trips =====
  pastTrips: any[] = [];

  // ===== Report Data =====
  report = {
    days: 7,
    tripsCompleted: 16,
    months: 1,
    profit: 'R$2300,00',
    dailyProfits: [42, 73, 59, 51, 67, 100],
    dailyLabels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dailyValues: [105, 183, 148, 128, 168, 250],
  };

  verFaturamento(): void {
    this.router.navigate(['/faturamento']);
  }

  // ===== Pricing =====
  pricing = {
    ratePerKm: '---/km',
    routes: [
      { distance: '50km', price: 'R$35,00' },
      { distance: '100km', price: 'R$70,00' },
    ],
  };

  // ===== Navigation =====
  ofertarViagem(): void {
    this.router.navigate(['/ofertar-viagem']);
  }

  verMaisViagens(): void {
    this.router.navigate(['/viagens-motorista']);
  }

  alterarValores(): void {
    this.router.navigate(['/ajustar-valores']);
  }

  editarVeiculo(): void {
    this.router.navigate(['/seu-veiculo']);
  }
}
