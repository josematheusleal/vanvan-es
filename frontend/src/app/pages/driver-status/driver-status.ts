import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-driver-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-status.html',
  styleUrl: './driver-status.css',
})
export class DriverStatus implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  user = this.authService.currentUser;

  status = computed(() => {
    const u = this.user();
    if (!u) return 'PENDING';
    return u.registrationStatus ?? 'PENDING';
  });

  rejectionReason = computed(() => {
    const u = this.user();
    return u?.rejectionReason ?? '';
  });

  isPending = computed(() => this.status() === 'PENDING');
  isRejected = computed(() => this.status() === 'REJECTED');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.user();
    // If APPROVED or not a driver, redirect away
    if (user && (user.role !== 'DRIVER' || user.registrationStatus === 'APPROVED')) {
      this.router.navigate(['/home']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
