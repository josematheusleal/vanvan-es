import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PastTrip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-viagens-motorista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viagens-motorista.html',
  styleUrls: ['./viagens-motorista.css']
})
export class ViagensMotorista {

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private tripService: TripService
  ) {
    // Carregar viagens quando o usuário estiver disponível
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.tripsLoaded) {
        this.tripsLoaded = true;
        this.loadTrips(user.id);
      }
    });
  }

  // ===== State =====
  isLoading = true;
  errorMessage = '';
  private tripsLoaded = false;

  // ===== Filter =====
  selectedFilter: 'all' | 'completed' | 'cancelled' = 'all';

  // ===== Trips Data =====
  pastTrips: PastTrip[] = [];


  // ===== Computed =====
  get filteredTrips(): PastTrip[] {
    if (this.selectedFilter === 'all') {
      return this.pastTrips;
    }
    return this.pastTrips.filter(trip => trip.status === this.selectedFilter);
  }

  get completedTripsCount(): number {
    return this.pastTrips.filter(trip => trip.status === 'completed').length;
  }

  get cancelledTripsCount(): number {
    return this.pastTrips.filter(trip => trip.status === 'cancelled').length;
  }

  get totalEarnings(): string {
    const total = this.pastTrips
      .filter(trip => trip.status === 'completed')
      .reduce((sum, trip) => {
        const value = parseFloat(trip.price.replace('R$', '').replace(',', '.'));
        return sum + (value * (trip.passengers ?? 0));
      }, 0);
    return `R$${total.toFixed(2).replace('.', ',')}`;
  }

  // ===== Methods =====
  private loadTrips(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Utilizando o backend via TripService (a busca de history driverId = userId é via /api/trips/history)
    this.tripService.getTripHistory(undefined, undefined, userId).subscribe({
      next: (response) => {
        this.pastTrips = response.content.map(trip => ({
          id: trip.id.toString(),
          origin: trip.departureCity,
          originLocation: '---', // backend omit details on history list usually
          originReference: '',
          destination: trip.arrivalCity,
          destinationLocation: '---',
          destinationReference: '',
          price: `R$${(trip.totalAmount || 0).toFixed(2).replace('.', ',')}`,
          distance: trip.route || 'N/A',
          date: new Date(trip.date).toLocaleDateString('pt-BR'), // convert "YYYY-MM-DD" para "DD/MM/YYYY" conforme UI
          time: trip.time,
          passengers: trip.passengerCount || 0,
          status: (trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS')
                  ? undefined 
                  : trip.status === 'CANCELLED' ? 'cancelled' : 'completed',
          vehicleName: trip.driverName, // Hack até obtermos nome do veículo do history list
          vehiclePlate: '' 
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching driver trips history', err);
        this.pastTrips = []; // fallback to empty state
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

  }

  setFilter(filter: 'all' | 'completed' | 'cancelled'): void {
    this.selectedFilter = filter;
  }

  repeatTrip(trip: PastTrip): void {
    // Navegar para ofertar viagem com os dados preenchidos
    this.router.navigate(['/ofertar-viagem'], {
      queryParams: {
        departureCity: trip.origin,
        departureLocation: trip.originLocation,
        departureReference: trip.originReference,
        destinationCity: trip.destination,
        destinationLocation: trip.destinationLocation,
        destinationReference: trip.destinationReference
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/motorista']);
  }

  formatDate(dateStr: string): { day: string; month: string } {
    const parts = dateStr.split('/');
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return {
      day: parts[0],
      month: months[parseInt(parts[1]) - 1] || ''
    };
  }
}

