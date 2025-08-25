import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Unit, UnitType } from '../models/unit.models';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private unitsSource = new BehaviorSubject<Unit[]>([]);
  units$ = this.unitsSource.asObservable();

  private productionQueueSource = new BehaviorSubject<{buildingId: string, unitType: string, timeLeft: number}[]>([]);
  productionQueue$ = this.productionQueueSource.asObservable();

  private gameLoopSubscription?: Subscription;

  readonly unitTypes: UnitType[] = [
    {
      name: 'Archer',
      health: 80,
      attack: 35,
      defense: 10,
      speed: 2,
      range: 4,
      cost: { wood: 25, food: 15, gold: 10 },
      productionTime: 8,
      requiredBuilding: 'Arquería',
      description: 'Ranged unit effective against infantry'
    },
    {
      name: 'Knight',
      health: 120,
      attack: 45,
      defense: 25,
      speed: 3,
      range: 1,
      cost: { wood: 30, food: 25, gold: 20 },
      productionTime: 12,
      requiredBuilding: 'Establo',
      description: 'Heavy cavalry unit with high armor'
    },
    {
      name: 'Soldier',
      health: 100,
      attack: 30,
      defense: 15,
      speed: 2,
      range: 1,
      cost: { wood: 20, food: 20, gold: 15 },
      productionTime: 10,
      requiredBuilding: 'Cuartel',
      description: 'Versatile infantry unit'
    }
  ];

  constructor() {
    this.startGameLoop();
  }

  private startGameLoop() {
    this.gameLoopSubscription = interval(100).subscribe(() => {
      this.updateUnits();
      this.updateProduction();
    });
  }

  produceUnit(buildingId: string, unitType: string) {
    const unitTypeData = this.unitTypes.find(u => u.name === unitType);
    if (!unitTypeData) return;

    const currentQueue = this.productionQueueSource.value;
    currentQueue.push({
      buildingId,
      unitType,
      timeLeft: unitTypeData.productionTime
    });
    this.productionQueueSource.next([...currentQueue]);
  }

  private updateProduction() {
    const currentQueue = this.productionQueueSource.value;
    const updatedQueue = currentQueue.map(item => ({
      ...item,
      timeLeft: Math.max(0, item.timeLeft - 0.1)
    }));

    // Remove completed units and spawn them
    const completedItems = updatedQueue.filter(item => item.timeLeft <= 0);
    const remainingQueue = updatedQueue.filter(item => item.timeLeft > 0);

    completedItems.forEach(item => {
      this.spawnUnit(item.buildingId, item.unitType);
    });

    this.productionQueueSource.next(remainingQueue);
  }

  private spawnUnit(buildingId: string, unitType: string) {
    const unitTypeData = this.unitTypes.find(u => u.name === unitType);
    if (!unitTypeData) return;

    const newUnit: Unit = {
      id: this.generateUnitId(),
      type: unitType,
      position: { x: 50, y: 200 }, // Default spawn position
      health: unitTypeData.health,
      maxHealth: unitTypeData.health,
      attack: unitTypeData.attack,
      defense: unitTypeData.defense,
      speed: unitTypeData.speed,
      range: unitTypeData.range,
      owner: 'player1', // TODO: Determine based on building ownership
      isMoving: true,
      productionTime: unitTypeData.productionTime
    };

    const currentUnits = this.unitsSource.value;
    this.unitsSource.next([...currentUnits, newUnit]);
  }

  private updateUnits() {
    const currentUnits = this.unitsSource.value;
    const updatedUnits = currentUnits.map(unit => {
      if (unit.isMoving) {
        // Simple movement towards enemy (right for player1, left for player2)
        const direction = unit.owner === 'player1' ? 1 : -1;
        return {
          ...unit,
          position: {
            ...unit.position,
            x: unit.position.x + (unit.speed * direction * 0.1)
          }
        };
      }
      return unit;
    });

    this.unitsSource.next(updatedUnits);
  }

  private generateUnitId(): string {
    return 'unit_' + Math.random().toString(36).substr(2, 9);
  }

  getUnitType(unitTypeName: string): UnitType | undefined {
    return this.unitTypes.find(u => u.name === unitTypeName);
  }

  removeUnit(unitId: string) {
    const currentUnits = this.unitsSource.value;
    const updatedUnits = currentUnits.filter(unit => unit.id !== unitId);
    this.unitsSource.next(updatedUnits);
  }

  ngOnDestroy() {
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
  }
}