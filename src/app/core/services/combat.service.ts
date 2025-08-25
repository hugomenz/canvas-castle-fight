import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Unit } from '../models/unit.models';

export interface CombatResult {
  attackerId: string;
  defenderId: string;
  damage: number;
  isKill: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CombatService {
  private combatLogSource = new BehaviorSubject<CombatResult[]>([]);
  combatLog$ = this.combatLogSource.asObservable();

  processCombat(units: Unit[]): Unit[] {
    const updatedUnits = [...units];
    const combatResults: CombatResult[] = [];

    for (let i = 0; i < updatedUnits.length; i++) {
      const attacker = updatedUnits[i];
      if (attacker.health <= 0) continue;

      // Find nearest enemy unit within range
      const target = this.findNearestEnemy(attacker, updatedUnits);
      if (target && this.isInRange(attacker, target)) {
        // Stop moving when in combat
        attacker.isMoving = false;
        target.isMoving = false;

        // Calculate damage
        const damage = this.calculateDamage(attacker, target);
        target.health = Math.max(0, target.health - damage);

        combatResults.push({
          attackerId: attacker.id,
          defenderId: target.id,
          damage,
          isKill: target.health <= 0,
          timestamp: Date.now()
        });

        // If target is killed, attacker resumes movement
        if (target.health <= 0) {
          attacker.isMoving = true;
        }
      } else if (!target) {
        // No enemies in range, resume movement
        attacker.isMoving = true;
      }
    }

    // Update combat log
    if (combatResults.length > 0) {
      const currentLog = this.combatLogSource.value;
      this.combatLogSource.next([...currentLog, ...combatResults].slice(-50)); // Keep last 50 events
    }

    // Remove dead units
    return updatedUnits.filter(unit => unit.health > 0);
  }

  private findNearestEnemy(unit: Unit, allUnits: Unit[]): Unit | null {
    const enemies = allUnits.filter(u => 
      u.owner !== unit.owner && 
      u.health > 0 && 
      u.id !== unit.id
    );

    if (enemies.length === 0) return null;

    let nearest = enemies[0];
    let minDistance = this.calculateDistance(unit, nearest);

    for (const enemy of enemies) {
      const distance = this.calculateDistance(unit, enemy);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private isInRange(attacker: Unit, target: Unit): boolean {
    const distance = this.calculateDistance(attacker, target);
    return distance <= attacker.range * 16; // Convert grid range to pixels
  }

  private calculateDistance(unit1: Unit, unit2: Unit): number {
    const dx = unit1.position.x - unit2.position.x;
    const dy = unit1.position.y - unit2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateDamage(attacker: Unit, defender: Unit): number {
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    
    // Damage calculation: attack - defense/2, minimum 1 damage
    const damage = Math.max(1, baseDamage - Math.floor(defense / 2));
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    return Math.floor(damage * randomFactor);
  }

  // Get combat effectiveness between unit types
  getCombatEffectiveness(attackerType: string, defenderType: string): number {
    const effectiveness: { [key: string]: { [key: string]: number } } = {
      'Archer': {
        'Soldier': 1.2,    // Archers are effective against infantry
        'Knight': 0.8,     // Less effective against armored cavalry
        'Archer': 1.0      // Normal effectiveness against other archers
      },
      'Knight': {
        'Archer': 1.3,     // Cavalry charges are effective against archers
        'Soldier': 1.1,    // Good against infantry
        'Knight': 1.0      // Normal against other cavalry
      },
      'Soldier': {
        'Knight': 1.2,     // Infantry with spears effective against cavalry
        'Archer': 0.9,     // Slightly less effective against ranged
        'Soldier': 1.0     // Normal against other infantry
      }
    };

    return effectiveness[attackerType]?.[defenderType] || 1.0;
  }

  clearCombatLog() {
    this.combatLogSource.next([]);
  }
}