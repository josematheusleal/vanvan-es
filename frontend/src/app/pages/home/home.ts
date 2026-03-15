import { Component, inject, OnDestroy, HostListener, ElementRef, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Buttons } from '../../components/buttons/buttons';
import { Skeleton } from '../../components/skeleton/skeleton';
import { CityService, City } from '../../services/city.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { TripService, TripHistoryDTO } from '../../services/trip.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Tag, Buttons, Skeleton, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private cityService = inject(CityService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private tripService = inject(TripService);

  typedDestinations = ['Recife', 'Garanhuns', 'Caruaru', 'Petrolina', 'João Pessoa'];
  currentDestination = '';
  private typedIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private destroyed = false;
  private typingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  isLoading = true;

  partidaQuery = '';
  destinoQuery = '';
  partidaSuggestions: City[] = [];
  destinoSuggestions: City[] = [];
  showPartidaDropdown = false;
  showDestinoDropdown = false;

  private partidaSearch$ = new Subject<string>();
  private destinoSearch$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor() {
    afterNextRender(() => {
      this.startTypingEffect();

      this.cityService.getAllCities().subscribe();

      this.subscriptions.push(
        this.partidaSearch$.pipe(
          debounceTime(250),
          switchMap(query => this.cityService.searchCities(query))
        ).subscribe(cities => {
          this.partidaSuggestions = cities;
          this.showPartidaDropdown = cities.length > 0;
        }),
        this.destinoSearch$.pipe(
          debounceTime(250),
          switchMap(query => this.cityService.searchCities(query))
        ).subscribe(cities => {
          this.destinoSuggestions = cities;
          this.showDestinoDropdown = cities.length > 0;
        })
      );

      this.fetchTripData();
    });
  }

  private fetchTripData(): void {
    // 1. Upcoming Trips (status = SCHEDULED)
    const upcomingSub = this.tripService.getTripHistory(undefined, undefined, undefined, undefined, undefined, 'SCHEDULED', 0, 5)
      .subscribe({
        next: (page) => {
          this.scheduledTrips = page.content.map((trip, index) => this.mapToUiTrip(trip, index === 0));
          this.checkLoadingState();
        },
        error: (err) => {
          console.error('Failed to load upcoming trips', err);
          this.checkLoadingState();
        }
      });

    // 2. Past Trips (status = COMPLETED)
    const pastSub = this.tripService.getTripHistory(undefined, undefined, undefined, undefined, undefined, 'COMPLETED', 0, 5)
      .subscribe({
        next: (page) => {
          this.pastTrips = page.content.map(trip => this.mapToUiTrip(trip, false));
          this.checkLoadingState();
        },
        error: (err) => {
          console.error('Failed to load past trips', err);
          this.checkLoadingState();
        }
      });

    this.subscriptions.push(upcomingSub, pastSub);
  }

  private checkLoadingState(): void {
    // Simple state update, could refine with separate loaders
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private mapToUiTrip(dto: TripHistoryDTO, isFirst: boolean): any {
    const dateObj = new Date(dto.date);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const monthStr = months[dateObj.getMonth()];
    const dayStr = String(dateObj.getDate() + 1).padStart(2, '0'); // Basic timezone adjustment

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
      origin: dto.departureCity,
      destination: dto.arrivalCity,
      price: `R$${dto.totalAmount.toFixed(2).replace('.', ',')}`,
      time: dto.time,
      vehicle: dto.route, // Assuming route string for now or fallback
      variant: variant,
      statusLabel: statusLabel,
      isFirst: isFirst
    };
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.typingTimeoutId !== null) {
      clearTimeout(this.typingTimeoutId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.partidaSearch$.complete();
    this.destinoSearch$.complete();
  }

  private startTypingEffect(): void {
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const type = () => {
      if (this.destroyed) return;

      const currentWord = this.typedDestinations[this.typedIndex];

      if (this.isDeleting) {
        this.currentDestination = currentWord.substring(0, this.charIndex - 1);
        this.charIndex--;

        if (this.charIndex === 0) {
          this.isDeleting = false;
          this.typedIndex = (this.typedIndex + 1) % this.typedDestinations.length;
          this.typingTimeoutId = setTimeout(type, 500);
          return;
        }
        this.typingTimeoutId = setTimeout(type, deleteSpeed);
      } else {
        this.currentDestination = currentWord.substring(0, this.charIndex + 1);
        this.charIndex++;

        if (this.charIndex === currentWord.length) {
          this.isDeleting = true;
          this.typingTimeoutId = setTimeout(type, pauseTime);
          return;
        }
        this.typingTimeoutId = setTimeout(type, typeSpeed);
      }
    };

    this.typingTimeoutId = setTimeout(type, 100);
  }

  onPartidaInput(): void {
    this.partidaSearch$.next(this.partidaQuery);
  }

  onDestinoInput(): void {
    this.destinoSearch$.next(this.destinoQuery);
  }

  selectPartida(city: City): void {
    this.partidaQuery = city.label;
    this.showPartidaDropdown = false;
  }

  selectDestino(city: City): void {
    this.destinoQuery = city.label;
    this.showDestinoDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPartidaDropdown = false;
      this.showDestinoDropdown = false;
    }
  }

  scheduledTrips: any[] = [];
  pastTrips: any[] = [];

  dataViagem = '';
  passageiros = 1;

  get passageirosLabel(): string {
    return this.passageiros === 1 ? '1 Passageiro' : `${this.passageiros} Passageiros`;
  }

  decrementPassageiros(): void {
    if (this.passageiros > 1) this.passageiros--;
  }

  incrementPassageiros(): void {
    if (this.passageiros < 5) this.passageiros++;
  }

  navigateToSearchTrips(): void {
    const queryParams: any = {};
    if (this.partidaQuery) queryParams.departureCity = this.partidaQuery;
    if (this.destinoQuery) queryParams.arrivalCity = this.destinoQuery;
    if (this.dataViagem) queryParams.date = this.dataViagem;
    if (this.passageiros) queryParams.passengerCount = this.passageiros;

    this.router.navigate(['/buscar-viagens'], { queryParams });
  }
}
