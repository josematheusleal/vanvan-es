import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientSidebar } from "../../sidebar/client-sidebar/client-sidebar";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, ClientSidebar],
  templateUrl: "./not-found.html",
})
export class NotFound {}
