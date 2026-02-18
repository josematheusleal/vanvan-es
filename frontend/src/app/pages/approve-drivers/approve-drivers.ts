import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DriverAdmin } from '../../services/admin.service';
import { Tag } from '../../components/tags/tags';

type TabType = 'PENDING' | 'REJECTED';

@Component({
  selector: 'app-approve-drivers',
  standalone: true,
  imports: [CommonModule, Tag],
  templateUrl: './approve-drivers.html',
  styleUrl: './approve-drivers.css',
})
export class ApproveDrivers implements OnInit {
  drivers = signal<DriverAdmin[]>([]);
  loading = signal(true);
  error = signal('');
  activeTab = signal<TabType>('PENDING');
  searchQuery = signal('');

  // Pagination
  currentPage = signal(0);
  totalPages = signal(1);
  totalElements = signal(0);
  pageSize = 5;

  pendingCount = signal(0);
  rejectedCount = signal(0);

  // Reject modal
  showRejectModal = signal(false);
  rejectReason = '';
  private driverToReject: DriverAdmin | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDrivers();
    this.loadCounts();
  }

  switchTab(tab: TabType): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.listDrivers(this.activeTab(), this.currentPage(), this.pageSize).subscribe({
      next: (page) => {
        this.drivers.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar motoristas:', err);
        this.error.set('Erro ao carregar motoristas.');
        this.loading.set(false);
      },
    });
  }

  loadCounts(): void {
    this.adminService.listDrivers('PENDING', 0, 1).subscribe({
      next: (page) => this.pendingCount.set(page.totalElements),
    });
    this.adminService.listDrivers('REJECTED', 0, 1).subscribe({
      next: (page) => this.rejectedCount.set(page.totalElements),
    });
  }

  approve(driver: DriverAdmin): void {
    this.adminService.updateDriverStatus(driver.id, 'APPROVED').subscribe({
      next: () => {
        this.loadDrivers();
        this.loadCounts();
      },
      error: (err) => console.error('Erro ao aprovar:', err),
    });
  }

  reject(driver: DriverAdmin): void {
    this.driverToReject = driver;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  cancelReject(): void {
    this.showRejectModal.set(false);
    this.driverToReject = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.driverToReject || !this.rejectReason.trim()) return;
    this.adminService.updateDriverStatus(this.driverToReject.id, 'REJECTED', this.rejectReason.trim()).subscribe({
      next: () => {
        this.showRejectModal.set(false);
        this.driverToReject = null;
        this.rejectReason = '';
        this.loadDrivers();
        this.loadCounts();
      },
      error: (err) => console.error('Erro ao rejeitar:', err),
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadDrivers();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  shortId(id: string): string {
    return id.substring(0, 8).toUpperCase();
  }
}
