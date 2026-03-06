import { Component, ChangeDetectorRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Toggle } from '../../components/toggle/toggle';
import { Skeleton } from '../../components/skeleton/skeleton';

export interface RecentTrip {
  date: string;
  origin: string;
  destination: string;
  driver: string;
  status: string;
  variant: TagVariant;
  price: string;
}

export interface PopularRoute {
  origin: string;
  destination: string;
  count: number;
  trend: number;
}

export interface RevenueMonth {
  label: string;
  value: number;
  display: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, Tag, Toggle, Skeleton],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
})
export class Relatorios {
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  hoveredBarIndex: number | null = null;
  hoveredStatusIndex: number | null = null;
  hoveredDriverIndex: number | null = null;
  // --- Mock data (TODO: replace with API calls) ---

  kpis = {
    revenue: { value: 'R$ 42.580', change: 12.5 },
    trips: { value: '127', change: 8.3 },
    drivers: { value: '18', change: 0 },
    clients: { value: '342', change: 15.2 },
  };

  driverCounts = {
    ativos: 18,
    aguardando: 5,
    rejeitados: 3,
  };

  get maxDriverCount(): number {
    return Math.max(
      this.driverCounts.ativos,
      this.driverCounts.aguardando,
      this.driverCounts.rejeitados
    );
  }

  occupancyRate = 78;
  occupancyChange = 5;

  gaugeSegments: { angle: number; filled: boolean; opacity: number }[];

  private buildGauge(): { angle: number; filled: boolean; opacity: number }[] {
    const total = 30;
    const startAngle = -120;
    const endAngle = 120;
    const step = (endAngle - startAngle) / (total - 1);
    const filledCount = Math.round(total * this.occupancyRate / 100);

    return Array.from({ length: total }, (_, i) => ({
      angle: startAngle + i * step,
      filled: i < filledCount,
      opacity: i < filledCount ? 0.3 + 0.7 * (i / Math.max(filledCount - 1, 1)) : 1,
    }));
  }

  statusCounts = {
    confirmado: 89,
    aguardando: 23,
    cancelado: 8,
    finalizado: 7,
  };

  revenueMonths: RevenueMonth[] = [
    { label: 'Dez', value: 29800, display: '29.8K' },
    { label: 'Jan', value: 34500, display: '34.5K' },
    { label: 'Fev', value: 37850, display: '37.8K' },
    { label: 'Mar', value: 42580, display: '42.6K' },
  ];

  funnelData = [
    { label: 'Solicitadas', count: 127, color: 'bg-dark' },
    { label: 'Confirmadas', count: 112, color: 'bg-secondary' },
    { label: 'Realizadas',  count: 96,  color: 'bg-tetiary' },
  ];

  get totalTrips(): number {
    const s = this.statusCounts;
    return s.confirmado + s.aguardando + s.cancelado + s.finalizado;
  }

  get funnelMax(): number {
    return this.funnelData[0].count;
  }

  funnelDropoff(i: number): number {
    if (i === 0) return 0;
    const prev = this.funnelData[i - 1].count;
    const curr = this.funnelData[i].count;
    return Math.round(((prev - curr) / prev) * 100);
  }

  statusPercent(count: number): number {
    return this.totalTrips > 0 ? Math.round((count / this.totalTrips) * 100) : 0;
  }

  get maxRevenueValue(): number {
    return Math.max(...this.revenueMonths.map(m => m.value));
  }

  get revenueChange(): number {
    const m = this.revenueMonths;
    if (m.length < 2) return 0;
    const current = m[m.length - 1].value;
    const previous = m[m.length - 2].value;
    return +(((current - previous) / previous) * 100).toFixed(1);
  }

  barHeight(value: number): number {
    return Math.round((value / this.maxRevenueValue) * 100);
  }

  barTrend(i: number): 'up' | 'down' | 'same' {
    if (i === 0) return 'up';
    return this.revenueMonths[i].value >= this.revenueMonths[i - 1].value ? 'up' : 'down';
  }

  isCurrentMonth(i: number): boolean {
    return i === this.revenueMonths.length - 1;
  }

  isPreviousMonth(i: number): boolean {
    return i === this.revenueMonths.length - 2;
  }

  popularRoutes: PopularRoute[] = [
    { origin: 'Garanhuns', destination: 'Recife', count: 42, trend: 12 },
    { origin: 'Recife', destination: 'Garanhuns', count: 38, trend: 5 },
    { origin: 'Caruaru', destination: 'Recife', count: 25, trend: -3 },
    { origin: 'Petrolina', destination: 'Recife', count: 14, trend: 18 },
    { origin: 'João Pessoa', destination: 'Recife', count: 8, trend: 0 },
  ];

  get maxRouteCount(): number {
    return Math.max(...this.popularRoutes.map(r => r.count));
  }

  settings = {
    emailNotifications: true,
    autoReports: false,
    occupancyAlerts: true,
    weeklyDigest: true,
  };

  recentTrips: RecentTrip[] = [
    { date: '06/03', origin: 'Garanhuns', destination: 'Recife', driver: 'Carlos Silva', status: 'Confirmado', variant: 'success', price: 'R$ 40,00' },
    { date: '06/03', origin: 'Caruaru', destination: 'Recife', driver: 'Ana Souza', status: 'Aguardando', variant: 'warning', price: 'R$ 35,00' },
    { date: '05/03', origin: 'Recife', destination: 'Garanhuns', driver: 'Pedro Lima', status: 'Finalizado', variant: 'success', price: 'R$ 40,00' },
    { date: '05/03', origin: 'Petrolina', destination: 'Recife', driver: 'Maria Oliveira', status: 'Cancelado', variant: 'error', price: 'R$ 85,00' },
    { date: '04/03', origin: 'João Pessoa', destination: 'Recife', driver: 'José Santos', status: 'Finalizado', variant: 'success', price: 'R$ 50,00' },
    { date: '04/03', origin: 'Garanhuns', destination: 'Caruaru', driver: 'Carlos Silva', status: 'Finalizado', variant: 'success', price: 'R$ 25,00' },
  ];

  constructor() {
    this.gaugeSegments = this.buildGauge();

    afterNextRender(() => {
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1400);
      this.cdr.detectChanges();
    });
  }
}
