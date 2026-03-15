import { Component, OnDestroy, ChangeDetectorRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Buttons } from '../../components/buttons/buttons';
import { Skeleton } from '../../components/skeleton/skeleton';
import { ToastService } from '../../components/toast/toast.service';
import QRCode from 'qrcode';
import { TripService, TripHistoryDTO } from '../../services/trip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, RouterModule, Tag, Buttons, Skeleton],
  templateUrl: './viagens.html',
  styleUrls: ['./viagens.css']
})
export class Viagens implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);
  private tripService = inject(TripService);
  private router = inject(Router);

  isLoading = true;

  // Countdown timer
  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private countdownInterval: any = null;

  // QR Code
  qrCodeDataUrl: string = '';

  constructor() {
    afterNextRender(() => {
      this.startCountdown();

      this.startCountdown();
      this.fetchTrips();
    });
  }

  private fetchTrips(): void {
    // 1. Upcoming Trips (status = SCHEDULED)
    this.tripService.getTripHistory(undefined, undefined, undefined, undefined, undefined, 'SCHEDULED', 0, 10)
      .subscribe({
        next: (page) => {
          const mapped = page.content.map(trip => this.mapToUiTrip(trip));
          if (mapped.length > 0) {
            this.nextTrip = mapped[0]; // Set first as main
            this.scheduledTrips = mapped.slice(1); // Set rest as scheduled list
            // Update countdown to first trip
            this.startCustomCountdown(new Date(this.nextTrip.originalDate + 'T' + this.nextTrip.time));
          } else {
             this.nextTrip = null;
             this.scheduledTrips = [];
          }
          this.checkLoadingState();
        },
        error: (err) => {
          console.error('Failed to load upcoming trips', err);
          this.checkLoadingState();
        }
      });

    // 2. Past Trips (status = COMPLETED)
    this.tripService.getTripHistory(undefined, undefined, undefined, undefined, undefined, 'COMPLETED', 0, 10)
      .subscribe({
        next: (page) => {
          this.pastTrips = page.content.map(trip => this.mapToUiTrip(trip));
          this.checkLoadingState();
        },
        error: (err) => {
          console.error('Failed to load past trips', err);
          this.checkLoadingState();
        }
      });
  }

  private checkLoadingState() {
     this.isLoading = false;
     this.cdr.detectChanges();
  }

  private mapToUiTrip(dto: TripHistoryDTO): any {
    const dateObj = new Date(dto.date);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const monthStr = months[dateObj.getMonth()];
    const dayStr = String(dateObj.getDate() + 1).padStart(2, '0');

    let variant: TagVariant = 'warning';
    let statusLabel = 'Aguardando';

    switch (dto.status) {
      case 'SCHEDULED':
        variant = 'success';
        statusLabel = 'Confirmado';
        break;
      case 'COMPLETED':
        variant = 'success';
        statusLabel = 'Finalizado';
        break;
      case 'CANCELLED':
        variant = 'error';
        statusLabel = 'Cancelado';
        break;
      case 'IN_PROGRESS':
        variant = 'warning';
        statusLabel = 'Em Viagem';
        break;
    }

    return {
      id: dto.id,
      month: monthStr,
      day: dayStr,
      time: dto.time,
      origin: dto.departureCity,
      destination: dto.arrivalCity,
      price: `R$${dto.totalAmount.toFixed(2).replace('.', ',')}`,
      vehicle: dto.route,
      pickupPoint: 'Centro',
      driverName: dto.driverName,
      driverContact: 'Contato via chat',
      driverRating: 4.8,
      variant: variant,
      statusLabel: statusLabel,
      originalDate: dto.date
    };
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
      // Avoid arbitrary countdown if handled directly 
  }

  private startCustomCountdown(targetDate: Date): void {
     this.updateCountdown(targetDate);
     this.countdownInterval = setInterval(() => {
        this.updateCountdown(targetDate);
     }, 1000);
  }

  private updateCountdown(targetDate: Date): void {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance > 0) {
      this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  // Carousel state for scheduled trips
  scheduledScrollIndex = 0;

  // Cancel trip popup state
  showCancelPopup = false;
  cancelTripRef: any = null;

  // Ticket popup state
  showTicketPopup = false;
  ticketTripRef: any = null;
  ticketCode = 'ABC123';

  async openTicketPopup(trip: any): Promise<void> {
    this.ticketTripRef = trip;
    this.showTicketPopup = true;

    // Gerar QR Code
    const ticketData = JSON.stringify({
      code: this.ticketCode,
      trip: `${trip.origin} → ${trip.destination}`,
      date: `${trip.day}/${trip.month}`,
      time: trip.time,
      passenger: 'Passageiro VanVan',
      vehicle: trip.vehicle
    });

    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(ticketData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1B1B1F',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    }
  }

  closeTicketPopup(): void {
    this.showTicketPopup = false;
    this.ticketTripRef = null;
  }

  openCancelPopup(trip: any): void {
    this.cancelTripRef = trip;
    this.showCancelPopup = true;
  }

  closeCancelPopup(): void {
    this.showCancelPopup = false;
    this.cancelTripRef = null;
  }

  confirmCancelTrip(): void {
    if(!this.cancelTripRef || !this.cancelTripRef.id) return;
    this.tripService.cancelBooking(this.cancelTripRef.id).subscribe({
      next: () => {
        this.toastService.success('Viagem cancelada com sucesso!');
        this.fetchTrips();
        this.closeCancelPopup();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Erro ao cancelar a viagem.');
        this.closeCancelPopup();
      }
    });
  }

  rebookTrip(trip: any): void {
     const queryParams: any = {
        departureCity: trip.origin,
        arrivalCity: trip.destination,
        passengerCount: 1
     };

     // The user can re-choose the date on the search page manually
     this.router.navigate(['/buscar-viagens'], { queryParams });
  }

  // Avaliação popup state
  showEvaluatePopup = false;
  evaluateTripRef: any = null;
  currentRating = 0;
  currentComment = '';

  openEvaluatePopup(trip: any): void {
    this.evaluateTripRef = trip;
    this.showEvaluatePopup = true;
    this.currentRating = 0; // reset
    this.currentComment = ''; // reset
  }

  closeEvaluatePopup(): void {
    this.showEvaluatePopup = false;
    this.evaluateTripRef = null;
  }

  setRating(stars: number): void {
    this.currentRating = stars;
  }

  updateComment(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.currentComment = target.value;
    }
  }

  submitEvaluation(): void {
    // TODO: integrate with backend
    console.log('Avaliação enviada para a viagem:', this.evaluateTripRef, 'Nota:', this.currentRating, 'Comentário:', this.currentComment);
    this.toastService.success('Avaliação enviada com sucesso!');
    this.closeEvaluatePopup();
  }

  nextTrip: any = null;
  scheduledTrips: any[] = [];
  pastTrips: any[] = [];

  get currentScheduledTrip() {
    return this.scheduledTrips[this.scheduledScrollIndex] ?? this.scheduledTrips[0];
  }

  prevScheduled(): void {
    if (this.scheduledScrollIndex > 0) {
      this.scheduledScrollIndex--;
    }
  }

  nextScheduled(): void {
    if (this.scheduledScrollIndex < this.scheduledTrips.length - 1) {
      this.scheduledScrollIndex++;
    }
  }

  // Share trip via Web Share API
  async shareTrip(trip: any): Promise<void> {
    const shareData = {
      title: 'Minha Viagem VanVan',
      text: `Viagem de ${trip.origin} para ${trip.destination} no dia ${trip.day}/${trip.month} às ${trip.time}. Preço: ${trip.price}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
    }
  }
}
