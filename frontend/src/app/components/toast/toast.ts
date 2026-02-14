import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.2, 0, 0, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.2, 0, 0, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class Toast {
  constructor(public toastService: ToastService) {}
}
