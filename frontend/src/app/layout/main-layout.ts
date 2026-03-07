import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { routeAnimations } from '../app.animations';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  animations: [routeAnimations]
})
export class MainLayout {
  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute?.component : null;
  }
}
