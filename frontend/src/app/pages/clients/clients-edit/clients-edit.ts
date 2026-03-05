import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../services/client.service'; 

@Component({
  selector: 'app-cliente-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-edit.html',
})
export class ClienteEditComponent {

  @Input() set cliente(value: Partial<Cliente> | null) {
    if (value) {
      this.clienteEditado = { ...value };
    }
  }

  @Output() aoFechar = new EventEmitter<boolean>();

  clienteEditado: any = {}; // Cópia local para edição
  mostrarSenha = false;
  carregando = false;

  constructor(private clienteService: ClienteService) {}

  fechar() {
    this.aoFechar.emit(false);
  }

  salvar() {
    // CORRIGIDO: Estava usando this.motoristaEditado
    if (!this.clienteEditado.id) return;
    
    this.carregando = true;

    // CORRIGIDO: Chamando o clienteService e passando apenas o clienteEditado
    this.clienteService.editar(this.clienteEditado).subscribe({
      next: () => {
        this.carregando = false;
        this.aoFechar.emit(true);
      },
      error: (err: any) => {
        console.error('Erro:', err);
        this.carregando = false;
      }
    });
  }
}