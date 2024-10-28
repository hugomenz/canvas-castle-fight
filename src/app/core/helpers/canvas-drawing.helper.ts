import { BuildingConstants } from '../config/building-constants.config';
import { CanvasColors } from '../config/canvas-colors.config';
import { GameConstants } from '../config/game-constants';

export abstract class CanvasDrawHelper {
  private static canvasHeight = GameConstants.CANVAS_HEIGHT;
  private static canvasWidth = GameConstants.CANVAS_WIDTH;

  private static gridRows = GameConstants.GRID_ROWS;
  private static gridCols = GameConstants.GRID_COLS;
  private static cellSize = GameConstants.CELL_SIZE;

  private static playerZoneColumns = GameConstants.PLAYER_ZONE_MAX_COL;

  // Dibuja la cuadrícula en el canvas
  static drawGrid(ctx: CanvasRenderingContext2D) {
    console.log('Dibujando la cuadrícula...');
    console.log('Dimensiones del canvas:', this.canvasWidth, this.canvasHeight);
    console.log('Tamaño de celda:', this.cellSize);

    ctx.strokeStyle = CanvasColors.colors.gridLine;
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.canvasWidth; x += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= this.canvasHeight; y += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }
  }

  // Dibuja las zonas de los jugadores
  static drawZones(ctx: CanvasRenderingContext2D) {
    console.log('Valores en drawZones:', {
      playerZoneColumns: this.playerZoneColumns,
      canvasHeight: this.canvasHeight,
      gridCols: this.gridCols,
      cellSize: this.cellSize,
    });

    console.log(
      'CanvasColors.colors.player1Zone: ',
      CanvasColors.colors.player1Zone
    );

    ctx.fillStyle = CanvasColors.colors.player1Zone;
    ctx.fillRect(
      0,
      0,
      this.playerZoneColumns * this.cellSize,
      this.canvasHeight
    );

    ctx.fillStyle = CanvasColors.colors.player2Zone;
    ctx.fillRect(
      (this.gridCols - this.playerZoneColumns) * this.cellSize,
      0,
      this.playerZoneColumns * this.cellSize,
      this.canvasHeight
    );
  }

  // Dibuja las líneas divisorias
  static drawDividingLines(ctx: CanvasRenderingContext2D) {
    console.log('Dibujando líneas divisorias...');

    const middleRow = Math.floor(this.gridRows / 2);
    ctx.fillStyle = CanvasColors.colors.dividingLine;

    const forestHeight = 3;
    const forestStartCol = Math.floor(this.gridCols * 0.2);
    const forestEndCol = Math.floor(this.gridCols * 0.8);

    ctx.fillRect(
      forestStartCol * this.cellSize,
      middleRow * this.cellSize,
      (forestEndCol - forestStartCol) * this.cellSize,
      forestHeight * this.cellSize
    );
  }

  // Dibuja los edificios
  static drawBuildings(
    ctx: CanvasRenderingContext2D,
    buildings: { row: number; col: number; type: string }[]
  ) {
    const cellSize = GameConstants.CELL_SIZE;

    buildings.forEach((building) => {
      this.drawBuilding(ctx, building);
    });
  }

  // Dibuja un edificio individual
  static drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: { row: number; col: number; type: string }
  ) {
    const color = BuildingConstants.getBuildingColor(building.type);
    const size = BuildingConstants.getBuildingSize(building.type);

    ctx.fillStyle = color;
    ctx.fillRect(
      building.col * this.cellSize,
      building.row * this.cellSize,
      size.width * this.cellSize,
      size.height * this.cellSize
    );
  }
}
