import { Component } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  progreso = 0;
  intervalSubscription!: Subscription;
  intervalTime = 100; // Tiempo de intervalo en ms
  progressIncrement = 1; // Incremento de progreso en cada intervalo

  constructor(private gameService: GameService) {}

  ngOnInit() {
    const progresoInterval = interval(this.intervalTime);
    this.intervalSubscription = progresoInterval.subscribe(() => {
      this.progreso += this.progressIncrement;
      if (this.progreso >= 100) {
        this.progreso = 0;
        this.distribuirRecursos();
      }
    });
  }

  distribuirRecursos() {
    // Aumenta los recursos del jugador
    this.gameService.updateResources({
      wood: 10,
      food: 5,
      gold: 3,
      upgrade: 1,
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
