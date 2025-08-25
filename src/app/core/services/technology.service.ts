import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Technology } from '../models/unit.models';
import { UserResources } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class TechnologyService {
  private researchedTechnologiesSource = new BehaviorSubject<string[]>([]);
  researchedTechnologies$ = this.researchedTechnologiesSource.asObservable();

  private currentResearchSource = new BehaviorSubject<{techId: string, timeLeft: number} | null>(null);
  currentResearch$ = this.currentResearchSource.asObservable();

  readonly technologies: Technology[] = [
    {
      id: 'improved_archery',
      name: 'Improved Archery',
      description: 'Increases archer attack by 5 and range by 1',
      cost: { wood: 100, food: 50, gold: 75, upgrade: 1 },
      unlocks: ['long_bow'],
      prerequisites: [],
      researchTime: 30,
      effects: {
        unitBonuses: {
          'Archer': { attack: 5, range: 1 }
        }
      }
    },
    {
      id: 'heavy_armor',
      name: 'Heavy Armor',
      description: 'Increases knight defense by 10 and health by 20',
      cost: { wood: 50, food: 25, gold: 100, upgrade: 1 },
      unlocks: ['plate_armor'],
      prerequisites: [],
      researchTime: 25,
      effects: {
        unitBonuses: {
          'Knight': { defense: 10, health: 20 }
        }
      }
    },
    {
      id: 'weapon_mastery',
      name: 'Weapon Mastery',
      description: 'Increases soldier attack by 8',
      cost: { wood: 75, food: 75, gold: 50, upgrade: 1 },
      unlocks: ['master_smithing'],
      prerequisites: [],
      researchTime: 20,
      effects: {
        unitBonuses: {
          'Soldier': { attack: 8 }
        }
      }
    },
    {
      id: 'long_bow',
      name: 'Long Bow',
      description: 'Further increases archer range by 2',
      cost: { wood: 150, food: 75, gold: 100, upgrade: 2 },
      unlocks: [],
      prerequisites: ['improved_archery'],
      researchTime: 45,
      effects: {
        unitBonuses: {
          'Archer': { range: 2 }
        }
      }
    },
    {
      id: 'plate_armor',
      name: 'Plate Armor',
      description: 'Knights gain additional 15 defense and 30 health',
      cost: { wood: 100, food: 50, gold: 150, upgrade: 2 },
      unlocks: [],
      prerequisites: ['heavy_armor'],
      researchTime: 40,
      effects: {
        unitBonuses: {
          'Knight': { defense: 15, health: 30 }
        }
      }
    },
    {
      id: 'master_smithing',
      name: 'Master Smithing',
      description: 'All units gain +5 attack',
      cost: { wood: 200, food: 100, gold: 150, upgrade: 3 },
      unlocks: [],
      prerequisites: ['weapon_mastery'],
      researchTime: 60,
      effects: {
        unitBonuses: {
          'Archer': { attack: 5 },
          'Knight': { attack: 5 },
          'Soldier': { attack: 5 }
        }
      }
    },
    {
      id: 'economics',
      name: 'Economics',
      description: 'Increases resource generation by 25%',
      cost: { wood: 100, food: 100, gold: 100, upgrade: 1 },
      unlocks: ['trade_routes'],
      prerequisites: [],
      researchTime: 35,
      effects: {
        resourceBonuses: {
          'wood': 0.25,
          'food': 0.25,
          'gold': 0.25
        }
      }
    },
    {
      id: 'trade_routes',
      name: 'Trade Routes',
      description: 'Gold generation increased by 50%',
      cost: { wood: 50, food: 150, gold: 200, upgrade: 2 },
      unlocks: [],
      prerequisites: ['economics'],
      researchTime: 50,
      effects: {
        resourceBonuses: {
          'gold': 0.5
        }
      }
    }
  ];

  constructor() {
    // Start research timer
    setInterval(() => {
      this.updateResearch();
    }, 1000);
  }

  canResearch(techId: string, resources: UserResources, researchedTechs: string[]): boolean {
    const tech = this.technologies.find(t => t.id === techId);
    if (!tech) return false;

    // Check if already researched
    if (researchedTechs.includes(techId)) return false;

    // Check prerequisites
    const hasPrerequisites = tech.prerequisites.every(prereq => 
      researchedTechs.includes(prereq)
    );
    if (!hasPrerequisites) return false;

    // Check resources
    return resources.wood >= tech.cost.wood &&
           resources.food >= tech.cost.food &&
           resources.gold >= tech.cost.gold &&
           resources.upgrade >= tech.cost.upgrade;
  }

  startResearch(techId: string): boolean {
    const tech = this.technologies.find(t => t.id === techId);
    if (!tech) return false;

    const currentResearch = this.currentResearchSource.value;
    if (currentResearch) return false; // Already researching something

    this.currentResearchSource.next({
      techId,
      timeLeft: tech.researchTime
    });

    return true;
  }

  private updateResearch() {
    const currentResearch = this.currentResearchSource.value;
    if (!currentResearch) return;

    const updatedResearch = {
      ...currentResearch,
      timeLeft: Math.max(0, currentResearch.timeLeft - 1)
    };

    if (updatedResearch.timeLeft <= 0) {
      // Research completed
      const researched = this.researchedTechnologiesSource.value;
      this.researchedTechnologiesSource.next([...researched, currentResearch.techId]);
      this.currentResearchSource.next(null);
    } else {
      this.currentResearchSource.next(updatedResearch);
    }
  }

  getTechnology(techId: string): Technology | undefined {
    return this.technologies.find(t => t.id === techId);
  }

  getAvailableTechnologies(researchedTechs: string[]): Technology[] {
    return this.technologies.filter(tech => 
      !researchedTechs.includes(tech.id) &&
      tech.prerequisites.every(prereq => researchedTechs.includes(prereq))
    );
  }

  cancelResearch() {
    this.currentResearchSource.next(null);
  }
}