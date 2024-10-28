export abstract class GameConstants {
  static readonly CANVAS_HEIGHT = 400;
  static readonly CANVAS_WIDTH = 800;

  static readonly GRID_ROWS = 25;
  static readonly GRID_COLS = 50;
  static readonly CELL_SIZE = 16;

  static readonly PLAYER_ZONE_MAX_COL = 11;

  // Initial positions for structures for each player in a symmetrical layout
  static readonly PLAYER_1_CASTLE_POSITION = { row: 10, col: 2 };
  static readonly PLAYER_1_TOWER_1_POSITION = { row: 3, col: 8 };
  static readonly PLAYER_1_TOWER_2_POSITION = { row: 17, col: 8 };

  static readonly PLAYER_2_CASTLE_POSITION = { row: 10, col: 42 };
  static readonly PLAYER_2_TOWER_1_POSITION = { row: 3, col: 37 };
  static readonly PLAYER_2_TOWER_2_POSITION = { row: 17, col: 37 };

  static readonly initialStats = {
    wood: 100,
    food: 100,
    gold: 100,
    upgrade: 0,
  };

  static readonly buildings = [
    {
      name: 'Arquería',
      color: 'green',
      cost: { wood: 50, food: 0, gold: 30 },
      size: { width: 3, height: 3 },
    },
    {
      name: 'Establo',
      color: 'red',
      cost: { wood: 60, food: 20, gold: 40 },
      size: { width: 4, height: 3 },
    },
    {
      name: 'Cuartel',
      color: 'blue',
      cost: { wood: 70, food: 10, gold: 50 },
      size: { width: 3, height: 3 },
    },
  ];

  static getBuildingCost(buildingName: string) {
    const building = this.buildings.find((b) => b.name === buildingName);
    return building ? building.cost : { wood: 0, food: 0, gold: 0 };
  }
}
