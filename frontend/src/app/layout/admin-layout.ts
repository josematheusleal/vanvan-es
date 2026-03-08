import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Toast } from '../components/toast/toast';
import { routeAnimations } from '../app.animations';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Toast],
  templateUrl: './admin-layout.html',
  animations: [routeAnimations]
})
export class AdminLayout {
  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute?.component : null;
  }
}
