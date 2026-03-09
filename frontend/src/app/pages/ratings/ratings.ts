import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, Rating } from '../../services/rating.service';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ratings.html',
})
export class RatingsComponent implements OnInit {

  private ratingService = inject(RatingService);
  private toastService = inject(ToastService);

  listaAvaliacoes = signal<Rating[]>([]);
  carregando = signal(true);

  // Filtros
  termoBusca = signal('');
  statusFiltro = signal('all');

  ngOnInit() {
    this.carregarAvaliacoes();
  }

  carregarAvaliacoes() {
    this.carregando.set(true);
    const termo = this.termoBusca();
    const status = this.statusFiltro() === 'all' ? undefined : this.statusFiltro();

    this.ratingService.listar(termo, status).subscribe({
      next: (dados) => {
        this.listaAvaliacoes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar avaliações', err);
        this.toastService.error('Erro ao carregar as avaliações.');
        this.carregando.set(false);
      }
    });
  }

  onFilterChange() {
    this.carregarAvaliacoes();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.termoBusca.set(value);
    this.carregarAvaliacoes();
  }

  marcarComoAnalisado(rating: Rating) {
    this.ratingService.marcarComoAnalisado(rating.id).subscribe({
      next: (atualizado) => {
        const novaLista = this.listaAvaliacoes().map(r => r.id === atualizado.id ? atualizado : r);
        this.listaAvaliacoes.set(novaLista);
        this.toastService.success('Avaliação marcada como analisada');
      },
      error: () => this.toastService.error('Erro ao marcar avaliação')
    });
  }

  ocultarComentario(rating: Rating) {
    if (confirm('Tem certeza que deseja ocultar este comentário de outros usuários?')) {
      this.ratingService.ocultarComentario(rating.id).subscribe({
        next: (atualizado) => {
          const novaLista = this.listaAvaliacoes().map(r => r.id === atualizado.id ? atualizado : r);
          this.listaAvaliacoes.set(novaLista);
          this.toastService.success('Comentário ocultado');
        },
        error: () => this.toastService.error('Erro ao ocultar comentário')
      });
    }
  }

  // Helper para gerar array de estrelas (ex: para iterar no template)
  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
