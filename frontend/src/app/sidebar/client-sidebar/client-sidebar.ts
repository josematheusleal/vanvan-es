import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-sidebar.html',
})
export class ClientSidebar {
  private router = inject(Router);
  
  isExpanded = signal(false);
  activePage = signal('home');

  setActivePage(page: string) {
    this.activePage.set(page);
    // Add logic later
  }
}
