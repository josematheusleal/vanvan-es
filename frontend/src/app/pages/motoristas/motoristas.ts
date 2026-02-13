import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Motorista {
  id: number;
  nome: string;
  status: 'Ativo' | 'Em análise' | 'Recusado';
}

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motoristas.html',
  styleUrl: './motoristas.css',
})
export class Motoristas {
  filtro = '';
  motoristas: Motorista[] = [
    { id: 1, nome: 'João Silva de oleiveira santos da comadre', status: 'Ativo' },
    { id: 2, nome: 'Maria Oliveira', status: 'Em análise' },
    { id: 3, nome: 'Carlos Pereira', status: 'Recusado' },
    { id: 4, nome: 'Ana Souza', status: 'Ativo' },
    { id: 5, nome: 'Pedro Santos', status: 'Em análise' },
    { id: 6, nome: 'Luiza Costa', status: 'Recusado' },
    { id: 7, nome: 'Rafael Lima', status: 'Ativo' },
    { id: 8, nome: 'Fernanda Alves', status: 'Em análise' },
    { id: 9, nome: 'Bruno Rodrigues', status: 'Recusado' },
    { id: 10, nome: 'Carla Mendes', status: 'Ativo' },
    { id: 11, nome: 'Gustavo Ferreira', status: 'Em análise' },
    { id: 12, nome: 'Mariana Gomes', status: 'Recusado' },
    { id: 13, nome: 'Ricardo Barbosa', status: 'Ativo' },
    { id: 14, nome: 'Aline Ribeiro', status: 'Em análise' },
    { id: 15, nome: 'Felipe Martins', status: 'Recusado' },
  ];

  get motoristasFiltrados(): Motorista[] {
    return this.motoristas.filter((m) =>
      m.nome.toLowerCase().includes(this.filtro.toLowerCase()) || m.id.toString().includes(this.filtro)
    );
  }

  editar(motorista:Motorista){
    console.log('Editar motorista', motorista);
    // AQUI ABRE O MODAL DE EDIÇÃO
  }

  excluir(motorista:Motorista){
    console.log('Excluir motorista', motorista);
    // AQUI ABRE O MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
  }

  adicionar(motorista:Motorista){
    console.log('Adicionar motorista', motorista);
    // AQUI ABRE O MODAL DE ADIÇÃO DE MOTORISTA
  }

}
