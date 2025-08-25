import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameStats } from '../models/unit.models';

@Injectable({
  providedIn: 'root'
})
export class GameStatsService {
  private gameStatsSource = new BehaviorSubject<GameStats>({
    unitsProduced: 0,
    buildingsConstructed: 0,
    resourcesGathered: { wood: 0, food: 0, gold: 0 },
    unitsLost: 0,
    enemyUnitsDestroyed: 0,
    gameTime: 0,
    score: 0
  });
  gameStats$ = this.gameStatsSource.asObservable();

  private gameStartTime = Date.now();
  private gameTimer?: number;

  constructor() {
    this.startGameTimer();
  }

  private startGameTimer() {
    this.gameTimer = setInterval(() => {
      const currentStats = this.gameStatsSource.value;
      this.gameStatsSource.next({
        ...currentStats,
        gameTime: Math.floor((Date.now() - this.gameStartTime) / 1000)
      });
    }, 1000);
  }

  incrementUnitsProduced(count: number = 1) {
    const currentStats = this.gameStatsSource.value;
    this.gameStatsSource.next({
      ...currentStats,
      unitsProduced: currentStats.unitsProduced + count
    });
    this.updateScore();
  }

  incrementBuildingsConstructed(count: number = 1) {
    const currentStats = this.gameStatsSource.value;
    this.gameStatsSource.next({
      ...currentStats,
      buildingsConstructed: currentStats.buildingsConstructed + count
    });
    this.updateScore();
  }

  incrementResourcesGathered(wood: number = 0, food: number = 0, gold: number = 0) {
    const currentStats = this.gameStatsSource.value;
    this.gameStatsSource.next({
      ...currentStats,
      resourcesGathered: {
        wood: currentStats.resourcesGathered.wood + wood,
        food: currentStats.resourcesGathered.food + food,
        gold: currentStats.resourcesGathered.gold + gold
      }
    });
  }

  incrementUnitsLost(count: number = 1) {
    const currentStats = this.gameStatsSource.value;
    this.gameStatsSource.next({
      ...currentStats,
      unitsLost: currentStats.unitsLost + count
    });
    this.updateScore();
  }

  incrementEnemyUnitsDestroyed(count: number = 1) {
    const currentStats = this.gameStatsSource.value;
    this.gameStatsSource.next({
      ...currentStats,
      enemyUnitsDestroyed: currentStats.enemyUnitsDestroyed + count
    });
    this.updateScore();
  }

  private updateScore() {
    const stats = this.gameStatsSource.value;
    const score = (
      stats.unitsProduced * 10 +
      stats.buildingsConstructed * 50 +
      stats.enemyUnitsDestroyed * 25 -
      stats.unitsLost * 15 +
      Math.floor(stats.gameTime / 60) * 5 // Bonus for longer games
    );

    this.gameStatsSource.next({
      ...stats,
      score: Math.max(0, score)
    });
  }

  resetStats() {
    this.gameStatsSource.next({
      unitsProduced: 0,
      buildingsConstructed: 0,
      resourcesGathered: { wood: 0, food: 0, gold: 0 },
      unitsLost: 0,
      enemyUnitsDestroyed: 0,
      gameTime: 0,
      score: 0
    });
    this.gameStartTime = Date.now();
  }

  getFormattedGameTime(): string {
    const stats = this.gameStatsSource.value;
    const minutes = Math.floor(stats.gameTime / 60);
    const seconds = stats.gameTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }
}