import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientSidebar } from "../../sidebar/client-sidebar/client-sidebar";

@Component({
  selector: "app-unauthorized",
  standalone: true,
  imports: [CommonModule, ClientSidebar],
  templateUrl: "./unauthorized.html",
})
export class Unauthorized {}
