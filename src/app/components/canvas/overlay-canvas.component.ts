import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { GameService } from '../../core/services/game.service';
import {
  BuildingLocation,
  GridCoordinates,
} from '../../core/models/game.models';
import { GameConstants } from '../../core/config/game-constants';
import { CanvasColors } from '../../core/config/canvas-colors.config';
import { CanvasValidHelper } from '../../core/helpers/canvas-validation.helper';
import { BuildingConstants } from '../../core/config/building-constants.config';
import { CanvasUtils } from '../../core/helpers/canvas.utils';

@Component({
  selector: 'app-overlay-canvas',
  template: `
    <canvas
      #overlayCanvas
      [width]="canvasWidth"
      [height]="canvasHeight"
      class="overlay-canvas"
    ></canvas>
  `,
  styles: [
    `
      .overlay-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
      }
    `,
  ],
  standalone: true,
})
export class OverlayCanvasComponent {
  @ViewChild('overlayCanvas') overlayCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() player1Buildings!: BuildingLocation[];

  @Output() cellClicked = new EventEmitter<GridCoordinates>();

  public canvasWidth = GameConstants.CANVAS_WIDTH;
  public canvasHeight = GameConstants.CANVAS_HEIGHT;

  selectedBuilding!: string | null;

  private cellSize = GameConstants.CELL_SIZE;
  private gameService = inject(GameService);

  selectedBuilding$ = this.gameService.selectedBuilding$.subscribe(
    (selectedBuilding) => {
      this.selectedBuilding = selectedBuilding;

      const elements = CanvasUtils.getCanvasElements(this.overlayCanvasRef);
      if (!elements) return;
      const { canvas, ctx } = elements;

      if (this.selectedBuilding === null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        this.highlightPlayer1Zone(ctx);
      }
    }
  );

  // Use HostListener for mousemove, mouseout, and click events
  @HostListener('window:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent) {
    const canvasRect =
      this.overlayCanvasRef?.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    if (x >= 0 && y >= 0 && x <= this.canvasWidth && y <= this.canvasHeight) {
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);

      this.drawHoverEffect(row, col);
    } else {
      this.handleMouseOut();
    }
  }

  @HostListener('window:mouseout')
  handleMouseOut() {
    const ctx = this.overlayCanvasRef?.nativeElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      // If a building is selected, re-highlight Player 1's zone
      if (this.selectedBuilding) {
        this.highlightPlayer1Zone(ctx);
      }
    }
  }

  @HostListener('window:click', ['$event'])
  handleCanvasClick(event: MouseEvent) {
    const canvasRect =
      this.overlayCanvasRef?.nativeElement.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    if (x >= 0 && y >= 0 && x <= this.canvasWidth && y <= this.canvasHeight) {
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);

      this.cellClicked.emit({ row, col });
    }
  }

  initializeOverlayCanvas() {
    const elements = CanvasUtils.getCanvasElements(this.overlayCanvasRef);
    if (!elements) return;
    const { canvas, ctx } = elements;

    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If a building is selected, highlight Player 1's zone
      if (this.selectedBuilding) {
        this.highlightPlayer1Zone(ctx);
      }
    }
  }

  // Highlight Player 1's zone when a building is selected
  highlightPlayer1Zone(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = CanvasColors.colors.player1ZoneHighlight;
    ctx.fillRect(
      0,
      0,
      GameConstants.PLAYER_ZONE_MAX_COL * this.cellSize,
      this.canvasHeight
    );
  }

  // Draw hover effect on the overlay canvas
  drawHoverEffect(row: number, col: number) {
    if (!this.selectedBuilding) {
      // Clear the hover effect
      this.handleMouseOut();
      return;
    }

    const ctx = this.overlayCanvasRef?.nativeElement.getContext('2d');
    if (ctx && this.selectedBuilding) {
      // Clear previous hover effect
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Re-highlight Player 1's zone
      this.highlightPlayer1Zone(ctx);

      const size = BuildingConstants.getBuildingSize(this.selectedBuilding);

      // Align the preview within the grid boundaries
      row = Math.max(0, Math.min(row, GameConstants.GRID_ROWS - size.height));
      col = Math.max(0, Math.min(col, GameConstants.GRID_COLS - size.width));

      // Check if placement is valid
      if (
        CanvasValidHelper.isValidPlacement(
          row,
          col,
          size,
          this.player1Buildings
        )
      ) {
        ctx.fillStyle = CanvasColors.colors.hoverValid; // Valid placement color
      } else {
        ctx.fillStyle = CanvasColors.colors.hoverInvalid; // Invalid placement color
      }

      // Draw the building preview rectangle
      ctx.fillRect(
        col * this.cellSize,
        row * this.cellSize,
        size.width * this.cellSize,
        size.height * this.cellSize
      );
    } else if (ctx) {
      // If no building is selected, clear the hover effect
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }
}
