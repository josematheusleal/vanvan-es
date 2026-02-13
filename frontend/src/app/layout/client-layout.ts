import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientSidebar } from '../sidebar/client-sidebar/client-sidebar';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ClientSidebar],
  templateUrl: './client-layout.html',
})
export class ClientLayout {}
