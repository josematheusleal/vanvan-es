import { Component, OnInit, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteMap, RoutePoint } from '../../components/route-map/route-map';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Skeleton } from '../../components/skeleton/skeleton';

export interface TripPassenger {
  id: string;
  name: string;
  phone: string;
  boardingPoint: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface TripDetail {
  id: string;
  origin: string;
  originLocation: string;
  originReference: string;
  destination: string;
  destinationLocation: string;
  destinationReference: string;
  date: string;
  time: string;
  price: string;
  distance: string;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  driverName: string;
  driverPhone: string;
  driverRating: number;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleImage: string;
  originCoords: RoutePoint;
  destinationCoords: RoutePoint;
  passengers: TripPassenger[];
  hasAirConditioning: boolean;
  acceptsPets: boolean;
  hasLargeLuggage: boolean;
}

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, RouteMap, Tag, Skeleton],
  templateUrl: './trip-details.html',
  styleUrls: ['./trip-details.css'],
})
export class TripDetails implements OnInit {
  tripId: string = '';
  trip: TripDetail | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    afterNextRender(() => {
      this.loadTrip();
    });
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
  }

  private loadTrip(): void {
    this.isLoading = true;

    // TODO: Replace with real API call — tripService.getTripById(this.tripId)
    setTimeout(() => {
      this.trip = {
        id: this.tripId || '1',
        origin: 'Garanhuns',
        originLocation: 'Rodoviária de Garanhuns',
        originReference: 'Em frente ao relógio das flores',
        destination: 'Recife',
        destinationLocation: 'Terminal Integrado de Passageiros',
        destinationReference: 'TIP – Recife',
        date: '10/03/2026',
        time: '08:00',
        price: 'R$45,00',
        distance: '230 km',
        duration: '3h 20min',
        availableSeats: 6,
        totalSeats: 15,
        status: 'scheduled',
        driverName: 'Carlos Silva',
        driverPhone: '(87) 99999-1234',
        driverRating: 4.8,
        vehicleModel: 'Mercedes-Benz Sprinter 2022',
        vehiclePlate: 'ABC1D23',
        vehicleImage: 'assets/VAN-EMPTY.png',
        originCoords: { lat: -8.8828, lng: -36.4964 },
        destinationCoords: { lat: -8.0476, lng: -34.8770 },
        passengers: [
          { id: '1', name: 'Ana Maria Souza', phone: '(81) 99876-5432', boardingPoint: 'Rodoviária', status: 'confirmed' },
          { id: '2', name: 'João Pedro Lima', phone: '(81) 98765-4321', boardingPoint: 'Rodoviária', status: 'confirmed' },
          { id: '3', name: 'Maria Clara Oliveira', phone: '(87) 99654-3210', boardingPoint: 'Praça Mestre Dominguinhos', status: 'confirmed' },
          { id: '4', name: 'Lucas Henrique', phone: '(81) 97543-2109', boardingPoint: 'Rodoviária', status: 'pending' },
          { id: '5', name: 'Fernanda Costa', phone: '(87) 96432-1098', boardingPoint: 'Rodoviária', status: 'confirmed' },
          { id: '6', name: 'Rafael Santos', phone: '(81) 95321-0987', boardingPoint: 'Praça Mestre Dominguinhos', status: 'confirmed' },
          { id: '7', name: 'Beatriz Almeida', phone: '(87) 94210-9876', boardingPoint: 'Rodoviária', status: 'confirmed' },
          { id: '8', name: 'Gabriel Ferreira', phone: '(81) 93109-8765', boardingPoint: 'Rodoviária', status: 'confirmed' },
          { id: '9', name: 'Isabela Rodrigues', phone: '(87) 92098-7654', boardingPoint: 'Praça Mestre Dominguinhos', status: 'cancelled' },
        ],
        hasAirConditioning: true,
        acceptsPets: false,
        hasLargeLuggage: true,
      };

      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  get statusLabel(): string {
    switch (this.trip?.status) {
      case 'scheduled': return 'Agendada';
      case 'in-progress': return 'Em andamento';
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return '';
    }
  }

  get statusVariant(): TagVariant {
    switch (this.trip?.status) {
      case 'scheduled': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  }

  get confirmedCount(): number {
    return this.trip?.passengers.filter(p => p.status === 'confirmed').length ?? 0;
  }

  get pendingCount(): number {
    return this.trip?.passengers.filter(p => p.status === 'pending').length ?? 0;
  }

  get cancelledCount(): number {
    return this.trip?.passengers.filter(p => p.status === 'cancelled').length ?? 0;
  }

  get occupancyPercent(): number {
    if (!this.trip) return 0;
    const occupied = this.trip.totalSeats - this.trip.availableSeats;
    return Math.round((occupied / this.trip.totalSeats) * 100);
  }

  get formattedDate(): { day: string; month: string; year: string } {
    if (!this.trip) return { day: '', month: '', year: '' };
    const parts = this.trip.date.split('/');
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return {
      day: parts[0],
      month: months[parseInt(parts[1]) - 1] || '',
      year: parts[2],
    };
  }

  passengerStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return '';
    }
  }

  passengerStatusVariant(status: string): TagVariant {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  }

  goBack(): void {
    this.router.navigate(['/viagens']);
  }
}
