import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Toast } from './components/toast/toast';
import { routeAnimations } from './app.animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations]
})
export class App {
  protected readonly title = signal('frontend');

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute?.component : null;
  }
}

