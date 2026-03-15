import { TestBed } from '@angular/core/testing';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { RatingsComponent } from './ratings';
import { RatingService, Rating } from '../../services/rating.service';
import { ToastService } from '../../components/toast/toast.service';
import { PageResponse } from '../../models/pagination.model';

const mockRating = (overrides: Partial<Rating> = {}): Rating => ({
  id: 1,
  tripId: 1001,
  driverId: 'driver-uuid-1',
  driverName: 'João Souza',
  passengerId: 'passenger-uuid-1',
  passengerName: 'Maria Silva',
  score: 5,
  comment: 'Excelente viagem!',
  status: 'VISIBLE',
  createdAt: '2024-01-15T10:00:00Z',
  ...overrides
});

const mockPage = (ratings: Rating[]): PageResponse<Rating> => ({
  content: ratings,
  totalElements: ratings.length,
  totalPages: 1,
  number: 0,
  size: 100
});

function makeRatingMock(ratings: Rating[] = [mockRating()]) {
  return {
    listar: vi.fn().mockReturnValue(of(mockPage(ratings))),
    ocultarComentario: vi.fn().mockReturnValue(of(mockRating({ status: 'HIDDEN' })))
  };
}

describe('RatingsComponent', () => {
  let component: RatingsComponent;
  let ratingMock: ReturnType<typeof makeRatingMock>;
  let toastMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    ratingMock = makeRatingMock([
      mockRating({ id: 1, score: 5, status: 'VISIBLE' }),
      mockRating({ id: 2, score: 2, status: 'VISIBLE' }),
      mockRating({ id: 3, score: 4, status: 'HIDDEN' }),
    ]);
    toastMock = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DecimalPipe, RatingsComponent],
      providers: [
        { provide: RatingService, useValue: ratingMock },
        { provide: ToastService, useValue: toastMock }
      ]
    });
    component = TestBed.createComponent(RatingsComponent).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit / carregarAvaliacoes ────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should load ratings on init', () => {
      component.ngOnInit();
      expect(ratingMock.listar).toHaveBeenCalled();
      expect(component.listaAvaliacoes().length).toBe(3);
    });

    it('should set carregando=false after load', () => {
      component.ngOnInit();
      expect(component.carregando()).toBe(false);
    });

    it('should show error toast on failure', () => {
      ratingMock.listar.mockReturnValue(throwError(() => new Error('fail')));
      component.ngOnInit();
      expect(toastMock.error).toHaveBeenCalled();
      expect(component.carregando()).toBe(false);
    });

    it('should pass status=hidden to service when filter is hidden', () => {
      component.statusFiltro.set('hidden');
      component.carregarAvaliacoes();
      expect(ratingMock.listar).toHaveBeenCalledWith('hidden');
    });

    it('should pass undefined status when filter is all', () => {
      component.statusFiltro.set('all');
      component.carregarAvaliacoes();
      expect(ratingMock.listar).toHaveBeenCalledWith(undefined);
    });

    it('should filter negative ratings client-side', () => {
      component.statusFiltro.set('negative');
      component.ngOnInit();
      expect(component.listaAvaliacoes().every(r => r.score <= 3)).toBe(true);
    });
  });

  // ─── computed stats ───────────────────────────────────────────────────────

  describe('computed stats', () => {
    beforeEach(() => component.ngOnInit());

    it('totalPositivas should count ratings with score >= 4', () => {
      expect(component.totalPositivas()).toBe(2); // scores 5 and 4
    });

    it('totalNegativas should count ratings with score <= 3', () => {
      expect(component.totalNegativas()).toBe(1); // score 2
    });

    it('mediaGeral should calculate average score', () => {
      const expected = (5 + 2 + 4) / 3;
      expect(component.mediaGeral()).toBeCloseTo(expected);
    });

    it('mediaGeral should return 0 for empty list', () => {
      component.listaAvaliacoes.set([]);
      expect(component.mediaGeral()).toBe(0);
    });
  });

  // ─── getContagem ─────────────────────────────────────────────────────────

  describe('getContagem', () => {
    beforeEach(() => component.ngOnInit());

    it('should return total count for "all"', () => {
      expect(component.getContagem('all')).toBe(3);
    });

    it('should return negative count for "negative"', () => {
      expect(component.getContagem('negative')).toBe(1);
    });

    it('should return count of HIDDEN ratings for "hidden"', () => {
      expect(component.getContagem('hidden')).toBe(1); // id 3 has status HIDDEN
    });
  });

  // ─── ocultarComentario ───────────────────────────────────────────────────

  describe('ocultarComentario', () => {
    beforeEach(() => {
      component.ngOnInit();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('should call ocultarComentario on service with rating id', () => {
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      expect(ratingMock.ocultarComentario).toHaveBeenCalledWith(rating.id);
    });

    it('should update rating status to HIDDEN in list', () => {
      const hiddenRating = mockRating({ id: 1, status: 'HIDDEN' });
      ratingMock.ocultarComentario.mockReturnValue(of(hiddenRating));
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      const updated = component.listaAvaliacoes().find(r => r.id === 1);
      expect(updated?.status).toBe('HIDDEN');
    });

    it('should show success toast after hiding', () => {
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      expect(toastMock.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      ratingMock.ocultarComentario.mockReturnValue(throwError(() => new Error('fail')));
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      expect(toastMock.error).toHaveBeenCalled();
    });

    it('should NOT call service when user cancels confirm', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      expect(ratingMock.ocultarComentario).not.toHaveBeenCalled();
    });
  });

  // ─── limparBusca ─────────────────────────────────────────────────────────

  describe('limparBusca', () => {
    it('should reset termoBusca and reload', () => {
      component.termoBusca.set('alguma coisa');
      component.limparBusca();
      expect(component.termoBusca()).toBe('');
      expect(ratingMock.listar).toHaveBeenCalled();
    });
  });

  // ─── getStarsArray ────────────────────────────────────────────────────────

  describe('getStarsArray', () => {
    it('should return [1, 2, 3, 4, 5]', () => {
      expect(component.getStarsArray()).toEqual([1, 2, 3, 4, 5]);
    });
  });
});