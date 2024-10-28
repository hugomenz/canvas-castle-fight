import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameConstants } from '../config/game-constants';
import { UserResources } from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private selectedBuildingSource = new BehaviorSubject<string | null>(null);
  selectedBuilding$ = this.selectedBuildingSource.asObservable();

  private resourcesSource = new BehaviorSubject<UserResources>(
    GameConstants.initialStats
  );
  resources$ = this.resourcesSource.asObservable();

  // Método para seleccionar una construcción
  selectBuilding(building: string | null) {
    console.log('GameService: Selecting building:', building);
    this.selectedBuildingSource.next(building);
  }

  // Método para actualizar recursos (añadiendo o restando valores)
  updateResources(resources: Partial<UserResources>) {
    const currentResources = this.resourcesSource.value;
    this.resourcesSource.next({
      wood: currentResources.wood + (resources.wood || 0),
      food: currentResources.food + (resources.food || 0),
      gold: currentResources.gold + (resources.gold || 0),
      // upgrade no se incluye en la actualización de costos de construcción
      upgrade: currentResources.upgrade + (resources.upgrade || 0),
    });
  }

  // Método para verificar si hay suficientes recursos para construir
  hasEnoughResources(cost: Partial<UserResources>): boolean {
    const resources = this.resourcesSource.value;
    return (
      resources.wood >= (cost.wood || 0) &&
      resources.food >= (cost.food || 0) &&
      resources.gold >= (cost.gold || 0)
    );
  }

  // Método para gastar recursos al construir
  spendResources(cost: Partial<UserResources>) {
    this.updateResources({
      wood: -(cost.wood || 0),
      food: -(cost.food || 0),
      gold: -(cost.gold || 0),
    });
  }
}
