import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(message: string, type: ToastType = 'success', duration: number = 3000): void {
    const id = this.counter++;
    this.toasts.update(current => [...current, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
}
