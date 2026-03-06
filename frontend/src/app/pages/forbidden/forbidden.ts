import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientSidebar } from "../../sidebar/client-sidebar/client-sidebar";

@Component({
  selector: "app-forbidden",
  standalone: true,
  imports: [CommonModule, ClientSidebar],
  templateUrl: "./forbidden.html",
})
export class Forbidden {}
