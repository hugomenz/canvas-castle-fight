import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { GameService } from '../../../core/services/game.service';
import { GameConstants } from '../../../core/config/game-constants';
import { BaseCanvasComponent } from '../base-canvas.component';
import { OverlayCanvasComponent } from '../overlay-canvas.component';
import {
  BuildingLocation,
  GridCoordinates,
} from '../../../core/models/game.models';
import { BuildingConstants } from '../../../core/config/building-constants.config';
import { CanvasValidHelper } from '../../../core/helpers/canvas-validation.helper';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  imports: [BaseCanvasComponent, OverlayCanvasComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContentComponent implements OnInit {
  @Output() buildingsUpdated = new EventEmitter<void>();

  GameConstants = GameConstants;

  player1Buildings: BuildingLocation[] = [];
  player2Buildings: BuildingLocation[] = [];

  selectedBuilding: string | null = null;

  // Colors for different elements

  gameService = inject(GameService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.setupInitialStructures();

    // Subscribe to the selected building from the game service
    this.gameService.selectedBuilding$.subscribe((building) => {
      console.log(
        'MainContentComponent: Selected building updated to:',
        building
      );
      this.selectedBuilding = building;
    });
  }

  onCellClicked(event: GridCoordinates) {
    this.placeBuilding(event.row, event.col);
  }

  placeBuilding(row: number, col: number) {
    if (this.selectedBuilding) {
      const buildingCost = GameConstants.getBuildingCost(this.selectedBuilding);
      const size = BuildingConstants.getBuildingSize(this.selectedBuilding);

      if (this.gameService.hasEnoughResources(buildingCost)) {
        if (
          CanvasValidHelper.isValidPlacement(
            row,
            col,
            size,
            this.player1Buildings
          )
        ) {
          // Add the building to the player's buildings
          this.player1Buildings = [
            ...this.player1Buildings,
            { row, col, type: this.selectedBuilding },
          ];

          // Spend resources and deselect the building
          this.gameService.spendResources(buildingCost);
          this.gameService.selectBuilding(null); // Deselect the building
          this.buildingsUpdated.emit();
        } else {
          alert('No hay suficiente espacio para colocar el edificio aquí.');
        }
      } else {
        alert('No tienes suficientes recursos para construir esto.');
      }
    }
  }

  // Set up initial structures on the grid
  setupInitialStructures() {
    // Player 1 Buildings
    const player1Structures = [
      {
        position: GameConstants.PLAYER_1_CASTLE_POSITION,
        size: BuildingConstants.CASTLE_SIZE,
        type: 'castle',
      },
      {
        position: GameConstants.PLAYER_1_TOWER_1_POSITION,
        size: BuildingConstants.TOWER_SIZE,
        type: 'tower',
      },
      {
        position: GameConstants.PLAYER_1_TOWER_2_POSITION,
        size: BuildingConstants.TOWER_SIZE,
        type: 'tower',
      },
    ];

    player1Structures.forEach((structure) => {
      this.player1Buildings.push({
        row: structure.position.row,
        col: structure.position.col,
        type: structure.type,
      });
    });

    // Player 2 Buildings
    const player2Structures = [
      {
        position: GameConstants.PLAYER_2_CASTLE_POSITION,
        size: BuildingConstants.CASTLE_SIZE,
        type: 'castle',
      },
      {
        position: GameConstants.PLAYER_2_TOWER_1_POSITION,
        size: BuildingConstants.TOWER_SIZE,
        type: 'tower',
      },
      {
        position: GameConstants.PLAYER_2_TOWER_2_POSITION,
        size: BuildingConstants.TOWER_SIZE,
        type: 'tower',
      },
    ];

    player2Structures.forEach((structure) => {
      this.player2Buildings.push({
        row: structure.position.row,
        col: structure.position.col,
        type: structure.type,
      });
    });
  }
}
