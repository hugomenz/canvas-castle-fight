export interface UserResources {
  wood: number;
  food: number;
  gold: number;
  upgrade: number;
}

export interface BuildingLocation {
  row: number;
  col: number;
  type: string;
}

export interface GridCoordinates {
  row: number;
  col: number;
}
