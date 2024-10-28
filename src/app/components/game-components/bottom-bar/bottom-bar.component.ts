import { Component, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../../core/services/game.service';
import { tap } from 'rxjs';
import { GameConstants } from '../../../core/config/game-constants';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.scss',
})
export class BottomBarComponent {
  buildings = GameConstants.buildings;

  selectedBuilding!: string;

  selectedBuilding$ = this.gameService.selectedBuilding$.pipe(
    tap((selectedBuilding) => {
      if (selectedBuilding) this.selectedBuilding = selectedBuilding;
    })
  );

  constructor(private gameService: GameService) {}

  onBuild(name: string) {
    if (this.selectedBuilding === name) {
      this.selectedBuilding = '';
      this.gameService.selectBuilding(null);
    } else {
      this.gameService.selectBuilding(name);
    }
  }
}
