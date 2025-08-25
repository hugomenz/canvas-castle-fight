import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SaveGame } from '../models/unit.models';

@Injectable({
  providedIn: 'root'
})
export class SaveLoadService {
  private savedGamesSource = new BehaviorSubject<SaveGame[]>([]);
  savedGames$ = this.savedGamesSource.asObservable();

  private readonly STORAGE_KEY = 'canvas-castle-fight-saves';
  private readonly MAX_SAVES = 10;

  constructor() {
    this.loadSavesFromStorage();
  }

  saveGame(name: string, gameState: any): boolean {
    try {
      const newSave: SaveGame = {
        id: this.generateSaveId(),
        name: name || `Save ${Date.now()}`,
        timestamp: new Date(),
        gameState
      };

      const currentSaves = this.savedGamesSource.value;
      let updatedSaves = [newSave, ...currentSaves];

      // Limit number of saves
      if (updatedSaves.length > this.MAX_SAVES) {
        updatedSaves = updatedSaves.slice(0, this.MAX_SAVES);
      }

      this.savedGamesSource.next(updatedSaves);
      this.savesToStorage(updatedSaves);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  loadGame(saveId: string): SaveGame | null {
    const saves = this.savedGamesSource.value;
    return saves.find(save => save.id === saveId) || null;
  }

  deleteSave(saveId: string): boolean {
    try {
      const currentSaves = this.savedGamesSource.value;
      const updatedSaves = currentSaves.filter(save => save.id !== saveId);
      
      this.savedGamesSource.next(updatedSaves);
      this.savesToStorage(updatedSaves);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  exportSave(saveId: string): string | null {
    const save = this.loadGame(saveId);
    if (!save) return null;

    try {
      return JSON.stringify(save, null, 2);
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  importSave(saveData: string): boolean {
    try {
      const save: SaveGame = JSON.parse(saveData);
      
      // Validate save structure
      if (!this.isValidSave(save)) {
        return false;
      }

      // Generate new ID to avoid conflicts
      save.id = this.generateSaveId();
      save.timestamp = new Date();

      const currentSaves = this.savedGamesSource.value;
      const updatedSaves = [save, ...currentSaves].slice(0, this.MAX_SAVES);

      this.savedGamesSource.next(updatedSaves);
      this.savesToStorage(updatedSaves);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  private isValidSave(save: any): boolean {
    return save &&
           typeof save.id === 'string' &&
           typeof save.name === 'string' &&
           save.gameState &&
           save.gameState.resources &&
           Array.isArray(save.gameState.buildings);
  }

  private loadSavesFromStorage() {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const saves = JSON.parse(savedData);
        // Convert timestamp strings back to Date objects
        const processedSaves = saves.map((save: any) => ({
          ...save,
          timestamp: new Date(save.timestamp)
        }));
        this.savedGamesSource.next(processedSaves);
      }
    } catch (error) {
      console.error('Failed to load saves from storage:', error);
    }
  }

  private savesToStorage(saves: SaveGame[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to save to storage:', error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        // Remove oldest saves and try again
        const reducedSaves = saves.slice(0, Math.floor(this.MAX_SAVES / 2));
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedSaves));
          this.savedGamesSource.next(reducedSaves);
        } catch (retryError) {
          console.error('Failed to save even with reduced saves:', retryError);
        }
      }
    }
  }

  private generateSaveId(): string {
    return 'save_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
  }

  clearAllSaves(): boolean {
    try {
      this.savedGamesSource.next([]);
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear saves:', error);
      return false;
    }
  }

  getAutoSaveName(): string {
    const now = new Date();
    return `AutoSave ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
}