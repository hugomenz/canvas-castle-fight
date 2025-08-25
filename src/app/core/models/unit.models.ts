export interface Unit {
  id: string;
  type: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  owner: 'player1' | 'player2';
  target?: Unit | null;
  isMoving: boolean;
  productionTime: number;
}

export interface UnitType {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  cost: {
    wood: number;
    food: number;
    gold: number;
  };
  productionTime: number; // in seconds
  requiredBuilding: string;
  description: string;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: {
    wood: number;
    food: number;
    gold: number;
    upgrade: number;
  };
  unlocks: string[];
  prerequisites: string[];
  researchTime: number;
  effects: {
    unitBonuses?: { [unitType: string]: Partial<UnitType> };
    buildingBonuses?: { [buildingType: string]: any };
    resourceBonuses?: { [resource: string]: number };
  };
}

export interface GameStats {
  unitsProduced: number;
  buildingsConstructed: number;
  resourcesGathered: {
    wood: number;
    food: number;
    gold: number;
  };
  unitsLost: number;
  enemyUnitsDestroyed: number;
  gameTime: number;
  score: number;
}

export interface SaveGame {
  id: string;
  name: string;
  timestamp: Date;
  gameState: {
    resources: any;
    buildings: any[];
    units: Unit[];
    technologies: string[];
    gameTime: number;
    difficulty: string;
  };
}