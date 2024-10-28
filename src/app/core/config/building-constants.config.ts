import { CanvasColors } from './canvas-colors.config';

export abstract class BuildingConstants {
  static readonly CASTLE_SIZE = { width: 5, height: 5 };
  static readonly TOWER_SIZE = { width: 2, height: 2 };

  // Obtiene el tamaño de un edificio
  static getBuildingSize(type: string): { width: number; height: number } {
    switch (type) {
      case 'castle':
        return BuildingConstants.CASTLE_SIZE;
      case 'tower':
        return BuildingConstants.TOWER_SIZE;
      case 'Arquería':
      case 'Establo':
      case 'Cuartel':
        return { width: 3, height: 3 };
      default:
        return { width: 1, height: 1 };
    }
  }

  // Obtiene el color asociado a un edificio
  static getBuildingColor(building: string): string {
    switch (building) {
      case 'Arquería':
        return CanvasColors.colors.archerRange;
      case 'Establo':
        return CanvasColors.colors.stable;
      case 'Cuartel':
        return CanvasColors.colors.barracks;
      case 'castle':
        return CanvasColors.colors.castle;
      case 'tower':
        return CanvasColors.colors.tower;
      default:
        return CanvasColors.colors.empty;
    }
  }
}
