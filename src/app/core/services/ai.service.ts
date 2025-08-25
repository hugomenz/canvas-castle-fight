import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { GameService } from './game.service';
import { UnitService } from './unit.service';
import { BuildingLocation, UserResources } from '../models/game.models';
import { GameConstants } from '../config/game-constants';

export interface AISettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  aggressiveness: number; // 0-1
  economyFocus: number; // 0-1
  militaryFocus: number; // 0-1
  reactionTime: number; // seconds
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private aiEnabledSource = new BehaviorSubject<boolean>(false);
  aiEnabled$ = this.aiEnabledSource.asObservable();

  private aiResourcesSource = new BehaviorSubject<UserResources>(GameConstants.initialStats);
  aiResources$ = this.aiResourcesSource.asObservable();

  private aiBuildingsSource = new BehaviorSubject<BuildingLocation[]>([]);
  aiBuildings$ = this.aiBuildingsSource.asObservable();

  private aiSubscription?: Subscription;
  
  private readonly difficultySettings: { [key: string]: AISettings } = {
    easy: {
      difficulty: 'easy',
      aggressiveness: 0.3,
      economyFocus: 0.7,
      militaryFocus: 0.3,
      reactionTime: 5
    },
    medium: {
      difficulty: 'medium',
      aggressiveness: 0.5,
      economyFocus: 0.6,
      militaryFocus: 0.5,
      reactionTime: 3
    },
    hard: {
      difficulty: 'hard',
      aggressiveness: 0.7,
      economyFocus: 0.5,
      militaryFocus: 0.7,
      reactionTime: 2
    },
    expert: {
      difficulty: 'expert',
      aggressiveness: 0.9,
      economyFocus: 0.4,
      militaryFocus: 0.9,
      reactionTime: 1
    }
  };

  private currentSettings: AISettings = this.difficultySettings['medium'];
  private lastDecisionTime = 0;

  constructor(
    private gameService: GameService,
    private unitService: UnitService
  ) {}

  enableAI(difficulty: string = 'medium') {
    this.currentSettings = this.difficultySettings[difficulty] || this.difficultySettings['medium'];
    this.aiEnabledSource.next(true);
    this.startAILoop();
    this.setupAIResources();
  }

  disableAI() {
    this.aiEnabledSource.next(false);
    if (this.aiSubscription) {
      this.aiSubscription.unsubscribe();
    }
  }

  private setupAIResources() {
    // AI gets same resource generation as player with slight multiplier based on difficulty
    const multiplier = this.getDifficultyMultiplier();
    
    interval(100).subscribe(() => {
      if (!this.aiEnabledSource.value) return;
      
      const currentResources = this.aiResourcesSource.value;
      this.aiResourcesSource.next({
        wood: currentResources.wood + (10 * multiplier * 0.1),
        food: currentResources.food + (5 * multiplier * 0.1),
        gold: currentResources.gold + (3 * multiplier * 0.1),
        upgrade: currentResources.upgrade + (1 * multiplier * 0.1)
      });
    });
  }

  private startAILoop() {
    this.aiSubscription = interval(1000).subscribe(() => {
      if (!this.aiEnabledSource.value) return;
      
      const now = Date.now() / 1000;
      if (now - this.lastDecisionTime >= this.currentSettings.reactionTime) {
        this.makeAIDecision();
        this.lastDecisionTime = now;
      }
    });
  }

  private makeAIDecision() {
    const resources = this.aiResourcesSource.value;
    const buildings = this.aiBuildingsSource.value;
    
    // Decision priority based on AI settings
    const decisions = [
      { action: 'buildEconomy', priority: this.currentSettings.economyFocus },
      { action: 'buildMilitary', priority: this.currentSettings.militaryFocus },
      { action: 'produceUnits', priority: this.currentSettings.aggressiveness }
    ];

    // Sort by priority and add some randomness
    decisions.sort((a, b) => (b.priority + Math.random() * 0.2) - (a.priority + Math.random() * 0.2));

    // Execute highest priority action
    switch (decisions[0].action) {
      case 'buildEconomy':
        this.buildEconomyBuilding(resources, buildings);
        break;
      case 'buildMilitary':
        this.buildMilitaryBuilding(resources, buildings);
        break;
      case 'produceUnits':
        this.produceUnits(resources, buildings);
        break;
    }
  }

  private buildEconomyBuilding(resources: UserResources, buildings: BuildingLocation[]) {
    // Simple AI: build random building if can afford it
    const availableBuildings = GameConstants.buildings.filter(building => 
      resources.wood >= building.cost.wood &&
      resources.food >= building.cost.food &&
      resources.gold >= building.cost.gold
    );

    if (availableBuildings.length === 0) return;

    const buildingType = availableBuildings[Math.floor(Math.random() * availableBuildings.length)];
    const position = this.findValidAIBuildingPosition(buildingType.size);

    if (position) {
      // Spend AI resources
      this.spendAIResources(buildingType.cost);
      
      // Add building to AI buildings
      const currentBuildings = this.aiBuildingsSource.value;
      this.aiBuildingsSource.next([
        ...currentBuildings,
        { row: position.row, col: position.col, type: buildingType.name }
      ]);
    }
  }

  private buildMilitaryBuilding(resources: UserResources, buildings: BuildingLocation[]) {
    // Prefer military buildings
    const militaryBuildings = ['Arquería', 'Establo', 'Cuartel'];
    const availableBuildings = GameConstants.buildings.filter(building => 
      militaryBuildings.includes(building.name) &&
      resources.wood >= building.cost.wood &&
      resources.food >= building.cost.food &&
      resources.gold >= building.cost.gold
    );

    if (availableBuildings.length === 0) return;

    const buildingType = availableBuildings[Math.floor(Math.random() * availableBuildings.length)];
    const position = this.findValidAIBuildingPosition(buildingType.size);

    if (position) {
      this.spendAIResources(buildingType.cost);
      
      const currentBuildings = this.aiBuildingsSource.value;
      this.aiBuildingsSource.next([
        ...currentBuildings,
        { row: position.row, col: position.col, type: buildingType.name }
      ]);
    }
  }

  private produceUnits(resources: UserResources, buildings: BuildingLocation[]) {
    // Find military buildings and produce units
    const militaryBuildings = buildings.filter(b => 
      ['Arquería', 'Establo', 'Cuartel'].includes(b.type)
    );

    if (militaryBuildings.length === 0) return;

    const building = militaryBuildings[Math.floor(Math.random() * militaryBuildings.length)];
    let unitType = '';

    switch (building.type) {
      case 'Arquería': unitType = 'Archer'; break;
      case 'Establo': unitType = 'Knight'; break;
      case 'Cuartel': unitType = 'Soldier'; break;
    }

    const unitTypeData = this.unitService.getUnitType(unitType);
    if (unitTypeData && this.canAffordUnit(resources, unitTypeData.cost)) {
      this.spendAIResources(unitTypeData.cost);
      // Note: This would need to be integrated with the unit service for AI units
      console.log(`AI producing ${unitType} from ${building.type}`);
    }
  }

  private findValidAIBuildingPosition(size: { width: number; height: number }): { row: number; col: number } | null {
    // Simple AI building placement on the right side of the map
    const startCol = GameConstants.GRID_COLS - GameConstants.PLAYER_ZONE_MAX_COL;
    const endCol = GameConstants.GRID_COLS - 2;
    
    for (let attempt = 0; attempt < 50; attempt++) {
      const row = Math.floor(Math.random() * (GameConstants.GRID_ROWS - size.height));
      const col = startCol + Math.floor(Math.random() * (endCol - startCol - size.width));
      
      if (this.isValidAIPosition(row, col, size)) {
        return { row, col };
      }
    }
    
    return null;
  }

  private isValidAIPosition(row: number, col: number, size: { width: number; height: number }): boolean {
    const buildings = this.aiBuildingsSource.value;
    
    // Check if position overlaps with existing buildings
    for (const building of buildings) {
      if (row < building.row + 3 && row + size.height > building.row &&
          col < building.col + 3 && col + size.width > building.col) {
        return false;
      }
    }
    
    return true;
  }

  private spendAIResources(cost: Partial<UserResources>) {
    const current = this.aiResourcesSource.value;
    this.aiResourcesSource.next({
      wood: current.wood - (cost.wood || 0),
      food: current.food - (cost.food || 0),
      gold: current.gold - (cost.gold || 0),
      upgrade: current.upgrade - (cost.upgrade || 0)
    });
  }

  private canAffordUnit(resources: UserResources, cost: any): boolean {
    return resources.wood >= cost.wood &&
           resources.food >= cost.food &&
           resources.gold >= cost.gold;
  }

  private getDifficultyMultiplier(): number {
    switch (this.currentSettings.difficulty) {
      case 'easy': return 0.8;
      case 'medium': return 1.0;
      case 'hard': return 1.2;
      case 'expert': return 1.5;
      default: return 1.0;
    }
  }

  getCurrentDifficulty(): string {
    return this.currentSettings.difficulty;
  }

  setDifficulty(difficulty: string) {
    this.currentSettings = this.difficultySettings[difficulty] || this.difficultySettings['medium'];
  }
}