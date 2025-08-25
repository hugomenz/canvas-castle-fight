import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { GameStatsService } from './game-stats.service';
import { BuildingLocation, UserResources } from '../models/game.models';

export interface VictoryCondition {
  id: string;
  name: string;
  description: string;
  type: 'destroy' | 'build' | 'survive' | 'score' | 'resources' | 'time';
  target: any;
  progress?: number;
  completed?: boolean;
}

export interface GameResult {
  winner: 'player1' | 'player2' | 'draw';
  condition: VictoryCondition;
  gameTime: number;
  finalScore: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VictoryConditionsService {
  private gameEndedSource = new BehaviorSubject<GameResult | null>(null);
  gameEnded$ = this.gameEndedSource.asObservable();

  private victoryConditionsSource = new BehaviorSubject<VictoryCondition[]>([]);
  victoryConditions$ = this.victoryConditionsSource.asObservable();

  private defaultConditions: VictoryCondition[] = [
    {
      id: 'destroy_castle',
      name: 'Castle Conquest',
      description: 'Destroy the enemy castle to achieve victory',
      type: 'destroy',
      target: { building: 'castle' }
    },
    {
      id: 'survive_time',
      name: 'Survival',
      description: 'Survive for 20 minutes to win',
      type: 'survive',
      target: { time: 1200 } // 20 minutes in seconds
    },
    {
      id: 'high_score',
      name: 'Score Victory',
      description: 'Reach 5000 points to win',
      type: 'score',
      target: { score: 5000 }
    },
    {
      id: 'resource_hoard',
      name: 'Economic Victory',
      description: 'Accumulate 1000 of each resource',
      type: 'resources',
      target: { wood: 1000, food: 1000, gold: 1000 }
    },
    {
      id: 'build_empire',
      name: 'Empire Builder',
      description: 'Build 20 structures',
      type: 'build',
      target: { count: 20 }
    }
  ];

  private currentMode: string = 'castle_conquest';

  constructor(private gameStatsService: GameStatsService) {
    this.setVictoryMode('castle_conquest');
    this.startVictoryCheck();
  }

  setVictoryMode(mode: string) {
    this.currentMode = mode;
    let conditions: VictoryCondition[] = [];

    switch (mode) {
      case 'castle_conquest':
        conditions = [this.defaultConditions[0]]; // Only castle destruction
        break;
      case 'survival':
        conditions = [this.defaultConditions[0], this.defaultConditions[1]]; // Castle + time
        break;
      case 'score_race':
        conditions = [this.defaultConditions[0], this.defaultConditions[2]]; // Castle + score
        break;
      case 'economic':
        conditions = [this.defaultConditions[0], this.defaultConditions[3]]; // Castle + resources
        break;
      case 'empire':
        conditions = [this.defaultConditions[0], this.defaultConditions[4]]; // Castle + buildings
        break;
      case 'all_conditions':
        conditions = [...this.defaultConditions];
        break;
      default:
        conditions = [this.defaultConditions[0]];
    }

    this.victoryConditionsSource.next(conditions);
  }

  private startVictoryCheck() {
    // Check victory conditions every second
    setInterval(() => {
      this.checkVictoryConditions();
    }, 1000);
  }

  private checkVictoryConditions() {
    const conditions = this.victoryConditionsSource.value;
    if (conditions.length === 0) return;

    for (const condition of conditions) {
      const result = this.evaluateCondition(condition);
      if (result) {
        this.endGame(result);
        return;
      }
    }
  }

  private evaluateCondition(condition: VictoryCondition): GameResult | null {
    switch (condition.type) {
      case 'destroy':
        return this.checkDestroyCondition(condition);
      case 'survive':
        return this.checkSurviveCondition(condition);
      case 'score':
        return this.checkScoreCondition(condition);
      case 'resources':
        return this.checkResourceCondition(condition);
      case 'build':
        return this.checkBuildCondition(condition);
      default:
        return null;
    }
  }

  private checkDestroyCondition(condition: VictoryCondition): GameResult | null {
    // This would need integration with building system to check if castle is destroyed
    // For now, return null (not implemented)
    return null;
  }

  private checkSurviveCondition(condition: VictoryCondition): GameResult | null {
    return new Promise<GameResult | null>((resolve) => {
      this.gameStatsService.gameStats$.subscribe(stats => {
        if (stats.gameTime >= condition.target.time) {
          resolve({
            winner: 'player1',
            condition,
            gameTime: stats.gameTime,
            finalScore: stats.score,
            timestamp: new Date()
          });
        } else {
          resolve(null);
        }
      }).unsubscribe();
    }) as any;
  }

  private checkScoreCondition(condition: VictoryCondition): GameResult | null {
    return new Promise<GameResult | null>((resolve) => {
      this.gameStatsService.gameStats$.subscribe(stats => {
        if (stats.score >= condition.target.score) {
          resolve({
            winner: 'player1',
            condition,
            gameTime: stats.gameTime,
            finalScore: stats.score,
            timestamp: new Date()
          });
        } else {
          resolve(null);
        }
      }).unsubscribe();
    }) as any;
  }

  private checkResourceCondition(condition: VictoryCondition): GameResult | null {
    // This would need integration with game service to check resources
    return null;
  }

  private checkBuildCondition(condition: VictoryCondition): GameResult | null {
    return new Promise<GameResult | null>((resolve) => {
      this.gameStatsService.gameStats$.subscribe(stats => {
        if (stats.buildingsConstructed >= condition.target.count) {
          resolve({
            winner: 'player1',
            condition,
            gameTime: stats.gameTime,
            finalScore: stats.score,
            timestamp: new Date()
          });
        } else {
          resolve(null);
        }
      }).unsubscribe();
    }) as any;
  }

  private endGame(result: GameResult) {
    this.gameEndedSource.next(result);
    this.saveGameResult(result);
  }

  private saveGameResult(result: GameResult) {
    const gameResults = JSON.parse(localStorage.getItem('canvas-castle-fight-results') || '[]');
    gameResults.unshift(result);
    
    // Keep only last 50 results
    if (gameResults.length > 50) {
      gameResults.splice(50);
    }
    
    localStorage.setItem('canvas-castle-fight-results', JSON.stringify(gameResults));
  }

  getGameResults(): GameResult[] {
    return JSON.parse(localStorage.getItem('canvas-castle-fight-results') || '[]');
  }

  resetGame() {
    this.gameEndedSource.next(null);
  }

  checkBuilding(buildingType: string, isDestroyed: boolean): boolean {
    if (isDestroyed && buildingType === 'castle') {
      const castleCondition = this.victoryConditionsSource.value.find(c => c.id === 'destroy_castle');
      if (castleCondition) {
        const result: GameResult = {
          winner: 'player1', // This should be determined by which castle was destroyed
          condition: castleCondition,
          gameTime: 0, // This should come from game stats
          finalScore: 0, // This should come from game stats
          timestamp: new Date()
        };
        this.endGame(result);
        return true;
      }
    }
    return false;
  }

  getCurrentMode(): string {
    return this.currentMode;
  }

  getVictoryModes(): { id: string; name: string; description: string }[] {
    return [
      { 
        id: 'castle_conquest', 
        name: 'Castle Conquest', 
        description: 'Destroy the enemy castle to win' 
      },
      { 
        id: 'survival', 
        name: 'Survival Mode', 
        description: 'Survive for 20 minutes or destroy the castle' 
      },
      { 
        id: 'score_race', 
        name: 'Score Race', 
        description: 'Reach 5000 points or destroy the castle' 
      },
      { 
        id: 'economic', 
        name: 'Economic Victory', 
        description: 'Hoard 1000 of each resource or destroy the castle' 
      },
      { 
        id: 'empire', 
        name: 'Empire Builder', 
        description: 'Build 20 structures or destroy the castle' 
      },
      { 
        id: 'all_conditions', 
        name: 'All Conditions', 
        description: 'Multiple ways to achieve victory' 
      }
    ];
  }
}