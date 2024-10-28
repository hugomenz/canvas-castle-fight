import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BuildingLocation } from '../../core/models/game.models';
import { GameConstants } from '../../core/config/game-constants';
import { CanvasUtils } from '../../core/helpers/canvas.utils';
import { CanvasDrawHelper } from '../../core/helpers/canvas-drawing.helper';

@Component({
  selector: 'app-base-canvas',
  template: `
    <canvas
      #baseCanvas
      [width]="canvasWidth"
      [height]="canvasHeight"
      class="base-canvas"
    ></canvas>
  `,
  styles: [
    `
      .base-canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
    `,
  ],
  standalone: true,
})
export class BaseCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('baseCanvas') baseCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() player1Buildings!: BuildingLocation[];
  @Input() player2Buildings!: BuildingLocation[];

  @Input() buildingsUpdated!: EventEmitter<void>;

  public canvasWidth = GameConstants.CANVAS_WIDTH;
  public canvasHeight = GameConstants.CANVAS_HEIGHT;

  ngOnInit(): void {
    this.buildingsUpdated.subscribe(() => this.initializeBaseCanvas());
  }

  ngAfterViewInit() {
    this.initializeBaseCanvas();
  }

  initializeBaseCanvas() {
    const elements = CanvasUtils.getCanvasElements(this.baseCanvasRef);
    if (!elements) {
      console.log('Error: No se pudo obtener el contexto de dibujo.');
      return;
    }
    const { canvas, ctx } = elements;

    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      console.log('Dibujando zonas de los jugadores'); // Log de depuración
      console.log('Canvas dimensions:', this.canvasWidth, this.canvasHeight);

      // Draw the zones
      CanvasDrawHelper.drawZones(ctx);

      // Draw initial buildings
      CanvasDrawHelper.drawBuildings(ctx, [
        ...this.player1Buildings,
        ...this.player2Buildings,
      ]);

      // Draw dividing lines or forest in the middle
      CanvasDrawHelper.drawDividingLines(ctx);

      // Draw the grid on top of everything
      CanvasDrawHelper.drawGrid(ctx);
    } else {
      console.log('Error: El contexto de dibujo (ctx) no está disponible.');
    }
  }
}
