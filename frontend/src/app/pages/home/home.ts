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

      // TODO: replace with real API call
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1200);
    });
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

  scheduledTrips = [
    { id: '1', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'success' as TagVariant, statusLabel: 'Confirmado', isFirst: true },
    { id: '2', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'warning' as TagVariant, statusLabel: 'Aguardando', isFirst: false },
    { id: '3', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
    { id: '4', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
    { id: '5', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
  ];

  pastTrips = [
    { id: '10', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
    { id: '11', month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
  ];

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
    this.router.navigate(['/buscar-viagens']);
  }
}
