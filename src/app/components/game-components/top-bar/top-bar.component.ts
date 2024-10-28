import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  gameService = inject(GameService);

  resources$ = this.gameService.resources$;
}
