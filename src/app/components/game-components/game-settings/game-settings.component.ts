import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../../core/services/ai.service';
import { SaveLoadService } from '../../../core/services/save-load.service';
import { GameStatsService } from '../../../core/services/game-stats.service';

@Component({
  selector: 'app-game-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss'
})
export class GameSettingsComponent implements OnInit {
  aiDifficulty: string = 'medium';
  aiEnabled: boolean = false;
  soundEnabled: boolean = true;
  musicEnabled: boolean = true;
  autoSaveEnabled: boolean = true;
  autoSaveInterval: number = 5; // minutes
  
  gameSpeed: number = 1;
  showFPS: boolean = false;
  showGrid: boolean = false;
  
  savedGames: any[] = [];

  constructor(
    private aiService: AIService,
    private saveLoadService: SaveLoadService,
    private gameStatsService: GameStatsService
  ) {}

  ngOnInit() {
    this.loadSettings();
    
    this.aiService.aiEnabled$.subscribe(enabled => {
      this.aiEnabled = enabled;
    });

    this.saveLoadService.savedGames$.subscribe(saves => {
      this.savedGames = saves;
    });
  }

  toggleAI() {
    if (this.aiEnabled) {
      this.aiService.disableAI();
    } else {
      this.aiService.enableAI(this.aiDifficulty);
    }
    this.saveSettings();
  }

  changeAIDifficulty() {
    this.aiService.setDifficulty(this.aiDifficulty);
    if (this.aiEnabled) {
      this.aiService.disableAI();
      this.aiService.enableAI(this.aiDifficulty);
    }
    this.saveSettings();
  }

  saveGame(name?: string) {
    const gameName = name || `Manual Save ${new Date().toLocaleString()}`;
    // This would need to gather current game state
    const gameState = {
      resources: { wood: 100, food: 100, gold: 100, upgrade: 0 },
      buildings: [],
      units: [],
      technologies: [],
      gameTime: 0,
      difficulty: this.aiDifficulty
    };
    
    this.saveLoadService.saveGame(gameName, gameState);
  }

  loadGame(saveId: string) {
    const save = this.saveLoadService.loadGame(saveId);
    if (save) {
      // This would need to restore game state
      console.log('Loading game:', save.name);
    }
  }

  deleteSave(saveId: string) {
    this.saveLoadService.deleteSave(saveId);
  }

  exportSave(saveId: string) {
    const saveData = this.saveLoadService.exportSave(saveId);
    if (saveData) {
      // Create download link
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-castle-fight-save-${saveId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  importSave(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const saveData = e.target?.result as string;
        if (this.saveLoadService.importSave(saveData)) {
          alert('Save imported successfully!');
        } else {
          alert('Failed to import save. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      this.gameStatsService.resetStats();
      // Reset other game state
      console.log('Game reset');
    }
  }

  clearAllSaves() {
    if (confirm('Are you sure you want to delete all saved games? This cannot be undone.')) {
      this.saveLoadService.clearAllSaves();
    }
  }

  private loadSettings() {
    const settings = localStorage.getItem('canvas-castle-fight-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.aiDifficulty = parsed.aiDifficulty || 'medium';
        this.soundEnabled = parsed.soundEnabled !== false;
        this.musicEnabled = parsed.musicEnabled !== false;
        this.autoSaveEnabled = parsed.autoSaveEnabled !== false;
        this.autoSaveInterval = parsed.autoSaveInterval || 5;
        this.gameSpeed = parsed.gameSpeed || 1;
        this.showFPS = parsed.showFPS || false;
        this.showGrid = parsed.showGrid || false;
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  private saveSettings() {
    const settings = {
      aiDifficulty: this.aiDifficulty,
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled,
      autoSaveEnabled: this.autoSaveEnabled,
      autoSaveInterval: this.autoSaveInterval,
      gameSpeed: this.gameSpeed,
      showFPS: this.showFPS,
      showGrid: this.showGrid
    };
    
    localStorage.setItem('canvas-castle-fight-settings', JSON.stringify(settings));
  }

  onSettingChange() {
    this.saveSettings();
  }
}
