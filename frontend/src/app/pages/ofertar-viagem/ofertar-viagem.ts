import { Component, HostListener, effect, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Toggle } from '../../components/toggle/toggle';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';
import { PastTrip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { CityService, City } from '../../services/city.service';

export interface TripOffer {
  // Partida (Departure)
  departureCity: string;
  departureLocation: string;
  departureReference: string;

  // Destino (Destination)
  destinationCity: string;
  destinationLocation: string;
  destinationReference: string;

  // Data e Horário
  date: string;
  time: string;

  // Veículo selecionado
  selectedVehicleId: string | null;

  // Pricing (Step 3)
  availableSeats: string;
}

/** Modelo de veículo para exibição no card de seleção */
export interface VehicleCard {
  id: string;
  name: string;
  plate: string;
  image: string;
}

export interface RepeatDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

@Component({
  selector: 'app-ofertar-viagem',
  standalone: true,
  imports: [CommonModule, FormsModule, Toggle],
  templateUrl: './ofertar-viagem.html',
  styleUrls: ['./ofertar-viagem.css']
})
export class OfertarViagem implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private tripService: TripService,
    private cityService: CityService
  ) {
    // Usar effect para reagir quando o usuário for carregado
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.vehiclesLoaded) {
        this.vehiclesLoaded = true;
        this.loadVehiclesForUser(user.id);
      }
    });

    // Verificar se há query params para preencher o formulário (repetir viagem)
    this.route.queryParams.subscribe(params => {
      if (params['departureCity']) {
        this.tripOffer.departureCity = params['departureCity'] || '';
        this.tripOffer.destinationCity = params['destinationCity'] || '';
        this.partidaQuery = this.tripOffer.departureCity;
        this.destinoQuery = this.tripOffer.destinationCity;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== Card State Management =====
  currentStep: 'form' | 'vehicles' | 'pricing' = 'form';
  showHistoryCard = false;
  showRepeatCard = false;
  selectedTripForRepeat: PastTrip | null = null;

  // ===== Pricing State =====
  suggestedPrice = 'R$40,00';
  suggestedDistance = '70km';
  changePrice = false;

  // ===== Form Data =====
  tripOffer: TripOffer = {
    departureCity: '',
    departureLocation: '',
    departureReference: '',
    destinationCity: '',
    destinationLocation: '',
    destinationReference: '',
    date: '',
    time: '',
    selectedVehicleId: null,
    availableSeats: ''
  };

  // ===== City Search (IBGE) =====
  partidaQuery = '';
  destinoQuery = '';
  partidaSuggestions: City[] = [];
  destinoSuggestions: City[] = [];
  showPartidaDropdown = false;
  showDestinoDropdown = false;

  private partidaSearch$ = new Subject<string>();
  private destinoSearch$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
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

    // Fetch real history
    this.fetchHistory();
  }

  fetchHistory(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.tripService.getTripHistory(undefined, undefined, userId, undefined, undefined, undefined, 0, 10).subscribe({
      next: (page: any) => {
        if (page.content && page.content.length > 0) {
          this.pastTrips = page.content.map((trip: any) => {
            const dt = new Date(trip.date);
            const day = String(dt.getDate() + 1).padStart(2, '0');
            const monthStr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][dt.getMonth()];
            
            return {
              id: trip.id.toString(),
              origin: trip.departureCity,
              destination: trip.arrivalCity,
              price: `R$${(trip.totalAmount || 0).toFixed(2).replace('.', ',')}`,
              distance: trip.route || '---',
              date: `${day} ${monthStr}`,
              time: trip.time
            };
          });
          this.showHistoryCard = true;
          this.cdr.detectChanges();
        } else {
          this.showHistoryCard = false;
        }
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.showHistoryCard = false;
      }
    });
  }

  private formatNominatimCity(city: string): string {
    // Extracts just the city name (e.g. "Garanhuns" from "Garanhuns - PE")
    // Nominatim works best with city name alone; backend already filters by countrycodes=br
    return city.split(' - ')[0].trim();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.partidaSearch$.complete();
    this.destinoSearch$.complete();
  }

  onPartidaInput(): void {
    this.tripOffer.departureCity = this.partidaQuery;
    this.partidaSearch$.next(this.partidaQuery);
  }

  onDestinoInput(): void {
    this.tripOffer.destinationCity = this.destinoQuery;
    this.destinoSearch$.next(this.destinoQuery);
  }

  selectPartida(city: City): void {
    this.partidaQuery = city.label;
    this.tripOffer.departureCity = city.label;
    this.showPartidaDropdown = false;
  }

  selectDestino(city: City): void {
    this.destinoQuery = city.label;
    this.tripOffer.destinationCity = city.label;
    this.showDestinoDropdown = false;
  }

  // ===== Vehicles =====
  vehicles: VehicleCard[] = [];
  isLoadingVehicles = true; // Começa como true
  private vehiclesLoaded = false;

  private loadVehiclesForUser(userId: string): void {
    this.isLoadingVehicles = true;

    this.vehicleService.getVehiclesByDriver(userId).subscribe({
      next: (response) => {
        this.vehicles = response.map(v => ({
          id: v.id,
          name: v.modelName,
          plate: v.licensePlate,
          image: v.photoPath ? this.vehicleService.getVehiclePhotoUrl(v.id) : 'assets/VAN-EMPTY.png'
        }));
        // Auto-selecionar o primeiro veículo se houver apenas um
        if (this.vehicles.length === 1) {
          this.tripOffer.selectedVehicleId = this.vehicles[0].id;
        }
        this.isLoadingVehicles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.errorMessage = 'Erro ao carregar veículos. Tente novamente.';
        this.isLoadingVehicles = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== Past Trips (for history) =====
  pastTrips: PastTrip[] = [];

  // ===== Repeat Days =====
  repeatDays: RepeatDays = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false
  };

  // ===== Form Validation State =====
  isLoading = false;
  errorMessage = '';

  // ===== Click Outside Handler =====
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside the cards area
    const cardsContainer = target.closest('.cards-container');
    const historyButton = target.closest('.history-button');
    const repeatButton = target.closest('.repeat-button');

    // Don't close if clicking on history button, repeat button, or inside cards
    if (historyButton || repeatButton || cardsContainer) {
      return;
    }

    // Close history and repeat cards when clicking outside
    if (this.showHistoryCard || this.showRepeatCard) {
      this.closeAllSideCards();
    }

    // Close Dropdowns if clicking outside
    const isDropdownPartida = target.closest('.partida-dropdown-container');
    const isDropdownDestino = target.closest('.destino-dropdown-container');
    if (!isDropdownPartida) this.showPartidaDropdown = false;
    if (!isDropdownDestino) this.showDestinoDropdown = false;
  }

  // ===== Navigation =====
  goToHistory(): void {
    this.showHistoryCard = !this.showHistoryCard;
    if (!this.showHistoryCard) {
      this.showRepeatCard = false;
      this.selectedTripForRepeat = null;
    }
  }

  closeAllSideCards(): void {
    this.showHistoryCard = false;
    this.showRepeatCard = false;
    this.selectedTripForRepeat = null;
  }

  goBack(): void {
    if (this.currentStep === 'pricing') {
      this.currentStep = 'vehicles';
    } else if (this.currentStep === 'vehicles') {
      this.currentStep = 'form';
    } else {
      this.router.navigate(['/motorista']);
    }
  }

  // ===== Form Submission =====
  onNext(): void {
    if (this.currentStep === 'form') {
      if (!this.isFormValid()) {
        this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
        return;
      }
      this.errorMessage = '';
      this.currentStep = 'vehicles';
    } else if (this.currentStep === 'vehicles') {
      if (!this.tripOffer.selectedVehicleId) {
        this.errorMessage = 'Por favor, selecione um veículo.';
        return;
      }
      this.errorMessage = '';
      this.currentStep = 'pricing';
    } else if (this.currentStep === 'pricing') {
      if (!this.tripOffer.availableSeats || parseInt(this.tripOffer.availableSeats) <= 0) {
        this.errorMessage = 'Por favor, informe a quantidade de assentos.';
        return;
      }
      this.submitTrip();
    }
  }

  submitTrip(): void {
    if (!this.tripOffer.selectedVehicleId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Convert date "DD/MM/YYYY" to "YYYY-MM-DD"
    const [day, month, year] = this.tripOffer.date.split('/');
    const departureDate = `${year}-${month}-${day}`;
    // Assuming departureTime is directly "HH:mm" from input
    const departureTime = this.tripOffer.time; 

    this.tripService.createTrip({
      date: departureDate,
      time: departureTime,
      departure: {
        city: this.formatNominatimCity(this.partidaQuery),
        street: this.tripOffer.departureLocation,
        reference: this.tripOffer.departureReference
      },
      arrival: {
        city: this.formatNominatimCity(this.destinoQuery),
        street: this.tripOffer.destinationLocation,
        reference: this.tripOffer.destinationReference
      },
      passengerIds: [],
      driverId: this.authService.currentUser()?.id || '',
      totalSeats: parseInt(this.tripOffer.availableSeats),
      vehicleId: Number(this.tripOffer.selectedVehicleId),
      status: 'SCHEDULED'
    }).subscribe({
      next: (trip) => {
        this.isLoading = false;
        this.toastService.success('Viagem ofertada com sucesso!');
        this.router.navigate(['/motorista']);
      },
      error: (err) => {
        console.error('Failed creating trip', err);
        this.errorMessage = 'Falha ao criar a viagem.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== Vehicle Selection =====
  selectVehicle(vehicleId: string): void {
    this.tripOffer.selectedVehicleId = vehicleId;
    this.errorMessage = '';
  }

  // ===== Repeat Trip =====
  openRepeatCard(trip: PastTrip): void {
    this.selectedTripForRepeat = trip;
    this.showRepeatCard = true;
    // Reset days to default
    this.repeatDays = {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false
    };
  }

  saveRepeatTrip(): void {
    if (!this.selectedTripForRepeat) return;

    console.log('Saving repeat trip:', {
      trip: this.selectedTripForRepeat,
      days: this.repeatDays
    });

    // TODO: Implement API call to save repeat trip

    // Close cards after saving
    this.showRepeatCard = false;
    this.selectedTripForRepeat = null;
  }

  verMaisViagens(): void {
    console.log('Ver mais viagens');
    // TODO: Implement load more trips
  }

  // ===== Validation =====
  isFormValid(): boolean {
    return !!(
      this.tripOffer.departureCity &&
      this.tripOffer.departureLocation &&
      this.tripOffer.destinationCity &&
      this.tripOffer.destinationLocation &&
      this.tripOffer.date &&
      this.tripOffer.time
    );
  }

  // ===== Date/Time Formatting =====
  formatDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }

    this.tripOffer.date = value.slice(0, 10);
  }

  formatTime(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    this.tripOffer.time = value.slice(0, 5);
  }
}
