import { Component, signal, inject, computed, ViewChildren, QueryList, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-sidebar.html',
})
export class ClientSidebar implements AfterViewInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.currentUser());
  isDriver = computed(() => {
    const user = this.currentUser();
    return user?.role?.toUpperCase() === 'DRIVER' && user?.registrationStatus === 'APPROVED';
  });

  @ViewChildren('navItem') navItems!: QueryList<ElementRef>;
  sliderStyle = signal({ left: '0px', width: '0px', opacity: '0' });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
       // Wait for RouterLinkActive to update classes
       setTimeout(() => this.updateSlider(), 50);
    });

    effect(() => {
        // Recalculate if driver status changes (DOM changes)
        const driver = this.isDriver(); 
        setTimeout(() => this.updateSlider(), 50);
    });

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.updateSlider());
    }
  }

  ngAfterViewInit() {
    // Initial calculation
    setTimeout(() => this.updateSlider(), 50);
  }

  updateSlider() {
    if (!this.navItems) return;
    
    const items = this.navItems.toArray();
    const activeItem = items.find(item => item.nativeElement.classList.contains('active-route'));

    if (activeItem) {
      const el = activeItem.nativeElement as HTMLElement;
      this.sliderStyle.set({
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
        opacity: '1'
      });
    } else {
      this.sliderStyle.set({
          left: '0px', 
          width: '0px', 
          opacity: '0' 
      });
    }
  }

  isExpanded = signal(false);
  activePage = signal('home');

  setActivePage(page: string) {
    this.activePage.set(page);
  }

  logout() {
    this.authService.logout();
  }
}
