import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, OnInit, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, TripHistoryDTO } from '../../services/trip.service';

@Component({
  selector: 'app-buscar-viagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-trips.html',
  styleUrls: ['./search-trips.css']
})
export class SearchTripsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLElement>;

  private tripService = inject(TripService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = true;
  viagens: any[] = [];
  
  canScrollLeft = false;
  canScrollRight = true;

  private scrollListener!: () => void;

  ngAfterViewInit() {
    const el = this.cardsContainer.nativeElement;
    this.scrollListener = () => this.updateScrollState();
    el.addEventListener('scroll', this.scrollListener);
    // check initial state after render
    setTimeout(() => this.updateScrollState(), 50);
  }

  ngOnDestroy() {
    const el = this.cardsContainer?.nativeElement;
    if (el && this.scrollListener) {
      el.removeEventListener('scroll', this.scrollListener);
    }
  }

  constructor() {
    afterNextRender(() => {
      this.initSearch();
    });
  }

  ngOnInit() {
  }

  private initSearch() {
    this.route.queryParams.subscribe(params => {
      this.isLoading = true;
      
      const date = params['date'];
      const departureCity = params['departureCity'];
      const arrivalCity = params['arrivalCity'];
      const passengerCount = params['passengerCount'] ? parseInt(params['passengerCount'], 10) : undefined;

      this.tripService.searchTrips(date, departureCity, arrivalCity, passengerCount).subscribe({
        next: (page) => {
          this.viagens = page.content.map(trip => this.mapToViagemUi(trip));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to search trips', err);
          this.isLoading = false;
        }
      });
    });
  }

  private mapToViagemUi(dto: TripHistoryDTO): any {
    const dateObj = new Date(dto.date);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const monthStr = months[dateObj.getMonth()];
    const dayStr = String(dateObj.getDate() + 1).padStart(2, '0');

    return {
      id: dto.id,
      origem: dto.departureCity,
      destino: dto.arrivalCity,
      mes: monthStr,
      dia: dayStr,
      horario: dto.time,
      vagas: dto.availableSeats,
      preco: dto.totalAmount,
      distancia: 0, // Ignored by UI mostly or mocked
      localPartida: 'Centro', // Fallbacks since summary doesn't have it
      pontoReferencia: 'Igreja principal',
      veiculoModelo: dto.route, // Displaying route or vehicle model
      veiculoPlaca: 'XXXX',
      motoristaNome: dto.driverName,
      motoristaNota: '4,9',
      imagemVeiculo: 'https://placehold.co/225x118'
    };
  }

  updateScrollState() {
    const el = this.cardsContainer.nativeElement;
    this.canScrollLeft = el.scrollLeft > 8;
    this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
  }

  // removed mock data

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
    this.tripService.bookTrip(this.viagemSelecionada.id).subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.showPaymentModal = true;
      },
      error: (err) => {
        console.error('Failed to book trip', err);
        alert('Erro ao reservar viagem. Verifique as vagas.');
      }
    });
  }


  fecharModalPagamento() {
    this.showPaymentModal = false;
    this.viagemSelecionada = {};
    // Pós pagamento ele viaja pro histórico dele
    this.router.navigate(['/viagens']);
  }

  scrollCardsLeft() {
    if (this.cardsContainer) {
      this.cardsContainer.nativeElement.scrollBy({ left: -504, behavior: 'smooth' });
      this.canScrollLeft = this.cardsContainer.nativeElement.scrollLeft - 504 > 8;
      this.canScrollRight = true;
    }
  }

  scrollCardsRight() {
    if (this.cardsContainer) {
      this.cardsContainer.nativeElement.scrollBy({ left: 504, behavior: 'smooth' });
      this.canScrollLeft = true;
      const el = this.cardsContainer.nativeElement;
      this.canScrollRight = el.scrollLeft + 504 + el.clientWidth < el.scrollWidth - 8;
    }
  }
}
