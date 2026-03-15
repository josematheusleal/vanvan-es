import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RatingService, Rating } from './rating.service';
import { PageResponse } from '../models/pagination.model';

const BASE = 'http://localhost:8080/api/ratings';

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

const mockPage = (ratings: Rating[], total = ratings.length): PageResponse<Rating> => ({
  content: ratings,
  totalElements: total,
  totalPages: Math.ceil(total / 10),
  number: 0,
  size: 100
});

describe('RatingService', () => {
  let service: RatingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RatingService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(RatingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('should GET /api/ratings/admin with default pagination', () => {
      const page = mockPage([mockRating()]);

      service.listar().subscribe(res => {
        expect(res.content.length).toBe(1);
        expect(res.content[0].score).toBe(5);
      });

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/admin` &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '100' &&
        !r.params.has('status')
      );
      expect(req.request.method).toBe('GET');
      req.flush(page);
    });

    it('should send status=HIDDEN when filtering by hidden', () => {
      service.listar('hidden').subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/admin` &&
        r.params.get('status') === 'HIDDEN'
      );
      req.flush(mockPage([]));
    });

    it('should send status=VISIBLE when filtering by visible', () => {
      service.listar('visible').subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/admin` &&
        r.params.get('status') === 'VISIBLE'
      );
      req.flush(mockPage([]));
    });

    it('should support custom page and size', () => {
      service.listar(undefined, 2, 20).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/admin` &&
        r.params.get('page') === '2' &&
        r.params.get('size') === '20'
      );
      req.flush(mockPage([]));
    });

    it('should return empty content when no ratings exist', () => {
      service.listar().subscribe(res => {
        expect(res.content).toEqual([]);
        expect(res.totalElements).toBe(0);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE}/admin`);
      req.flush(mockPage([]));
    });
  });

  // ─── ocultarComentario ────────────────────────────────────────────────────

  describe('ocultarComentario', () => {
    it('should PATCH /api/ratings/admin/:id/status with status=HIDDEN', () => {
      const updated = mockRating({ id: 1, status: 'HIDDEN' });

      service.ocultarComentario(1).subscribe(res => {
        expect(res.status).toBe('HIDDEN');
        expect(res.id).toBe(1);
      });

      const req = httpMock.expectOne(`${BASE}/admin/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'HIDDEN' });
      req.flush(updated);
    });

    it('should send the correct rating id in the URL', () => {
      service.ocultarComentario(42).subscribe();

      const req = httpMock.expectOne(`${BASE}/admin/42/status`);
      req.flush(mockRating({ id: 42, status: 'HIDDEN' }));
    });
  });

  // ─── getDriverMediaAvaliacao ──────────────────────────────────────────────

  describe('getDriverMediaAvaliacao', () => {
    it('should GET /api/ratings/me/average', () => {
      const mockAverage = { averageScore: 4.5, totalRatings: 10 };

      service.getDriverMediaAvaliacao().subscribe(res => {
        expect(res.averageScore).toBe(4.5);
        expect(res.totalRatings).toBe(10);
      });

      const req = httpMock.expectOne(`${BASE}/me/average`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAverage);
    });
  });
});