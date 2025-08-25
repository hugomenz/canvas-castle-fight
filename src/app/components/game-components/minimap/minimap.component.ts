import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BuildingLocation } from '../../../core/models/game.models';
import { GameConstants } from '../../../core/config/game-constants';

@Component({
  selector: 'app-minimap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minimap.component.html',
  styleUrl: './minimap.component.scss'
})
export class MinimapComponent implements OnInit, OnDestroy {
  @ViewChild('minimapCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() player1Buildings: BuildingLocation[] = [];
  @Input() player2Buildings: BuildingLocation[] = [];
  @Input() units: any[] = [];

  private destroy$ = new Subject<void>();
  private ctx?: CanvasRenderingContext2D;
  private scale = 4; // Scale factor for minimap
  
  readonly minimapWidth = GameConstants.GRID_COLS * this.scale;
  readonly minimapHeight = GameConstants.GRID_ROWS * this.scale;

  ngOnInit() {
    this.initializeCanvas();
    this.startRenderLoop();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    
    if (context) {
      this.ctx = context;
      canvas.width = this.minimapWidth;
      canvas.height = this.minimapHeight;
    }
  }

  private startRenderLoop() {
    // Update minimap every 100ms
    setInterval(() => {
      this.render();
    }, 100);
  }

  private render() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#2c5530'; // Dark green background
    this.ctx.fillRect(0, 0, this.minimapWidth, this.minimapHeight);

    // Draw grid zones
    this.drawZones();

    // Draw buildings
    this.drawBuildings();

    // Draw units
    this.drawUnits();

    // Draw border
    this.drawBorder();
  }

  private drawZones() {
    if (!this.ctx) return;

    // Player 1 zone (left side)
    this.ctx.fillStyle = 'rgba(46, 134, 171, 0.2)'; // Semi-transparent blue
    this.ctx.fillRect(
      0, 
      0, 
      GameConstants.PLAYER_ZONE_MAX_COL * this.scale, 
      this.minimapHeight
    );

    // Player 2 zone (right side)
    this.ctx.fillStyle = 'rgba(162, 59, 114, 0.2)'; // Semi-transparent pink
    this.ctx.fillRect(
      (GameConstants.GRID_COLS - GameConstants.PLAYER_ZONE_MAX_COL) * this.scale,
      0,
      GameConstants.PLAYER_ZONE_MAX_COL * this.scale,
      this.minimapHeight
    );

    // Center line
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.minimapWidth / 2, 0);
    this.ctx.lineTo(this.minimapWidth / 2, this.minimapHeight);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawBuildings() {
    if (!this.ctx) return;

    // Player 1 buildings (blue)
    this.ctx.fillStyle = '#2E86AB';
    this.player1Buildings.forEach(building => {
      this.ctx!.fillRect(
        building.col * this.scale,
        building.row * this.scale,
        3 * this.scale, // Building width
        3 * this.scale  // Building height
      );
    });

    // Player 2 buildings (red)
    this.ctx.fillStyle = '#A23B72';
    this.player2Buildings.forEach(building => {
      this.ctx!.fillRect(
        building.col * this.scale,
        building.row * this.scale,
        3 * this.scale,
        3 * this.scale
      );
    });

    // Draw castles with special marking
    this.drawCastles();
  }

  private drawCastles() {
    if (!this.ctx) return;

    // Player 1 castle
    this.ctx.fillStyle = '#1a5c80';
    this.ctx.fillRect(
      GameConstants.PLAYER_1_CASTLE_POSITION.col * this.scale,
      GameConstants.PLAYER_1_CASTLE_POSITION.row * this.scale,
      5 * this.scale,
      5 * this.scale
    );

    // Player 2 castle
    this.ctx.fillStyle = '#7a1f4f';
    this.ctx.fillRect(
      GameConstants.PLAYER_2_CASTLE_POSITION.col * this.scale,
      GameConstants.PLAYER_2_CASTLE_POSITION.row * this.scale,
      5 * this.scale,
      5 * this.scale
    );

    // Add castle icons
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(
      GameConstants.PLAYER_1_CASTLE_POSITION.col * this.scale + this.scale,
      GameConstants.PLAYER_1_CASTLE_POSITION.row * this.scale + this.scale,
      3 * this.scale,
      3 * this.scale
    );

    this.ctx.fillRect(
      GameConstants.PLAYER_2_CASTLE_POSITION.col * this.scale + this.scale,
      GameConstants.PLAYER_2_CASTLE_POSITION.row * this.scale + this.scale,
      3 * this.scale,
      3 * this.scale
    );
  }

  private drawUnits() {
    if (!this.ctx || !this.units) return;

    this.units.forEach(unit => {
      const x = (unit.position.x / GameConstants.CELL_SIZE) * this.scale;
      const y = (unit.position.y / GameConstants.CELL_SIZE) * this.scale;

      // Different colors for different players
      this.ctx!.fillStyle = unit.owner === 'player1' ? '#87CEEB' : '#FFB6C1';
      
      // Draw unit as small circle
      this.ctx!.beginPath();
      this.ctx!.arc(x, y, 2, 0, 2 * Math.PI);
      this.ctx!.fill();
    });
  }

  private drawBorder() {
    if (!this.ctx) return;

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.minimapWidth, this.minimapHeight);
  }

  onMinimapClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert minimap coordinates to game coordinates
    const gameX = (x / this.scale) * GameConstants.CELL_SIZE;
    const gameY = (y / this.scale) * GameConstants.CELL_SIZE;

    // Emit event to scroll main view to this position
    // This would need to be connected to the main canvas component
    console.log('Minimap clicked at game coordinates:', gameX, gameY);
  }
}
