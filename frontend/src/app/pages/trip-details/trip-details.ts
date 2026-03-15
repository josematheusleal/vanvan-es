import { Component, OnInit, ChangeDetectorRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteMap, RoutePoint } from '../../components/route-map/route-map';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Skeleton } from '../../components/skeleton/skeleton';
import { TripService, TripDetailsDTO, PassengerDTO } from '../../services/trip.service';

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
  trip: any | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private tripService = inject(TripService);

  constructor() {
    afterNextRender(() => {
      this.loadTrip();
    });
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
  }

  private loadTrip(): void {
    if (!this.tripId) return;

    this.isLoading = true;
    this.tripService.getTripDetails(Number(this.tripId)).subscribe({
      next: (dto) => {
        this.trip = this.mapToUiDetail(dto);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load trip details', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapToUiDetail(dto: TripDetailsDTO): any {
    // Parsing date
    const dt = new Date(dto.date);
    const day = String(dt.getDate() + 1).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();

    return {
      id: dto.id.toString(),
      origin: dto.departureCity,
      originLocation: dto.departureStreet || dto.departureCity,
      originReference: dto.departureReferencePoint || '-',
      destination: dto.arrivalCity,
      destinationLocation: dto.arrivalStreet || dto.arrivalCity,
      destinationReference: dto.arrivalReferencePoint || '-',
      date: `${day}/${month}/${year}`,
      time: dto.time,
      price: `R$${dto.totalAmount.toFixed(2).replace('.', ',')}`,
      distance: `${dto.distanceKm} km`,
      duration: `${dto.durationMinutes} min`,
      availableSeats: dto.availableSeats,
      totalSeats: dto.totalSeats,
      status: dto.status,
      driverName: dto.driverName,
      driverPhone: 'Em breve',
      driverRating: 4.8,
      vehicleModel: dto.vehicleModel || 'Van Padrão',
      vehiclePlate: dto.vehiclePlate || 'XXXX-XXX',
      vehicleImage: 'assets/VAN-EMPTY.png',
      originCoords: { lat: -8.8828, lng: -36.4964 }, // Hardcoded map coords initially
      destinationCoords: { lat: -8.0476, lng: -34.8770 },
      passengers: dto.passengers.map((p, i) => ({
        id: (i + 1).toString(),
        name: p.name,
        phone: p.phone,
        boardingPoint: dto.departureCity,
        status: 'confirmed'
      })),
      hasAirConditioning: true,
      acceptsPets: false,
      hasLargeLuggage: true,
    };
  }

  get statusLabel(): string {
    switch (this.trip?.status) {
      case 'SCHEDULED': return 'Agendada';
      case 'IN_PROGRESS': return 'Em andamento';
      case 'COMPLETED': return 'Finalizada';
      case 'CANCELLED': return 'Cancelada';
      default: return 'Agendada';
    }
  }

  get statusVariant(): TagVariant {
    switch (this.trip?.status) {
      case 'SCHEDULED': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'warning';
    }
  }

  get confirmedCount(): number {
    return this.trip?.passengers.filter((p: any) => p.status === 'confirmed').length ?? 0;
  }

  get pendingCount(): number {
    return this.trip?.passengers.filter((p: any) => p.status === 'pending').length ?? 0;
  }

  get cancelledCount(): number {
    return this.trip?.passengers.filter((p: any) => p.status === 'cancelled').length ?? 0;
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
