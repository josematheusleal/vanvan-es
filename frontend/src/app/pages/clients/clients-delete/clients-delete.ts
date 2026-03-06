import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../../../services/client.service'; 

@Component({
  selector: 'app-cliente-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-delete.html',
})
export class ClienteDeleteComponent {
  
  @Input() cliente: Partial<Cliente> | null = null;
  @Output() aoFechar = new EventEmitter<boolean>();

  carregando = false;

  constructor(private clienteService: ClienteService) {}

  fechar() {
    this.aoFechar.emit(false);
  }

  confirmarExclusao() {
    if (!this.cliente?.id) return;

    this.carregando = true;

    this.clienteService.excluir(this.cliente.id).subscribe({
      next: () => {
        this.carregando = false;
        this.aoFechar.emit(true); // Retorna true para a tabela atualizar
      },
      error: (err) => {
        console.error('Erro ao excluir cliente:', err);
        this.carregando = false;
        // Opcional: Mostrar um alerta de erro aqui
      }
    });
  }
}