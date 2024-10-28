import { BuildingConstants } from '../config/building-constants.config';
import { GameConstants } from '../config/game-constants';
import { BuildingLocation } from '../models/game.models';

export abstract class CanvasValidHelper {
  // Verifica si una celda está dentro del área de Player 1
  static isPlayer1Area(row: number, col: number): boolean {
    return col >= 0 && col < GameConstants.PLAYER_ZONE_MAX_COL;
  }

  // Verifica si una celda está ocupada por algún edificio
  static isCellOccupied(
    row: number,
    col: number,
    buildings: BuildingLocation[]
  ): boolean {
    return buildings.some((building) => {
      const size = BuildingConstants.getBuildingSize(building.type);
      return (
        row >= building.row &&
        row < building.row + size.height &&
        col >= building.col &&
        col < building.col + size.width
      );
    });
  }

  // Verifica si la colocación de un edificio es válida
  static isValidPlacement(
    row: number,
    col: number,
    size: { width: number; height: number },
    buildings: BuildingLocation[]
  ): boolean {
    if (
      row < 0 ||
      col < 0 ||
      row + size.height > GameConstants.GRID_ROWS ||
      col + size.width > GameConstants.GRID_COLS
    ) {
      return false;
    }

    for (let i = row; i < row + size.height; i++) {
      for (let j = col; j < col + size.width; j++) {
        if (!this.isPlayer1Area(i, j) || this.isCellOccupied(i, j, buildings)) {
          return false;
        }
      }
    }

    return true;
  }
}
