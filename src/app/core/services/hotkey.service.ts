import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface Hotkey {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: string;
  description: string;
  category: string;
}

export interface HotkeyEvent {
  action: string;
  originalEvent: KeyboardEvent;
}

@Injectable({
  providedIn: 'root'
})
export class HotkeyService {
  private hotkeyEventSource = new BehaviorSubject<HotkeyEvent | null>(null);
  hotkeyEvent$ = this.hotkeyEventSource.asObservable().pipe(
    filter(event => event !== null)
  ) as any;

  private isListening = false;

  private defaultHotkeys: Hotkey[] = [
    // Game Control
    { key: 'Space', action: 'pause_game', description: 'Pause/Resume Game', category: 'Game Control' },
    { key: 'Escape', action: 'cancel_selection', description: 'Cancel Selection', category: 'Game Control' },
    { key: 'Enter', action: 'confirm_action', description: 'Confirm Action', category: 'Game Control' },
    
    // Building Hotkeys
    { key: '1', action: 'select_archery', description: 'Select Archery Range', category: 'Buildings' },
    { key: '2', action: 'select_stable', description: 'Select Stable', category: 'Buildings' },
    { key: '3', action: 'select_barracks', description: 'Select Barracks', category: 'Buildings' },
    
    // Unit Production
    { key: 'a', action: 'produce_archer', description: 'Produce Archer', category: 'Units' },
    { key: 'k', action: 'produce_knight', description: 'Produce Knight', category: 'Units' },
    { key: 's', action: 'produce_soldier', description: 'Produce Soldier', category: 'Units' },
    
    // View Controls
    { key: 'm', action: 'toggle_minimap', description: 'Toggle Minimap', category: 'View' },
    { key: 'f', action: 'toggle_fullscreen', description: 'Toggle Fullscreen', category: 'View' },
    { key: 'g', action: 'toggle_grid', description: 'Toggle Grid', category: 'View' },
    
    // Quick Actions
    { key: 'q', action: 'quick_save', description: 'Quick Save', category: 'Quick Actions' },
    { key: 'l', action: 'quick_load', description: 'Quick Load', category: 'Quick Actions' },
    { key: 'r', action: 'restart_game', description: 'Restart Game', category: 'Quick Actions' },
    
    // Settings
    { key: 'F1', action: 'show_help', description: 'Show Help/Tutorial', category: 'Settings' },
    { key: 'Tab', action: 'toggle_settings', description: 'Toggle Settings Panel', category: 'Settings' },
    
    // Advanced
    { key: 'Delete', action: 'delete_selection', description: 'Delete Selected', category: 'Advanced' },
    { key: '+', action: 'increase_speed', description: 'Increase Game Speed', category: 'Advanced' },
    { key: '-', action: 'decrease_speed', description: 'Decrease Game Speed', category: 'Advanced' },
    
    // Debug (with Ctrl)
    { key: 'd', ctrl: true, action: 'toggle_debug', description: 'Toggle Debug Mode', category: 'Debug' },
    { key: 'r', ctrl: true, action: 'reload_page', description: 'Reload Page', category: 'Debug' },
    { key: 'i', ctrl: true, action: 'toggle_inspector', description: 'Toggle Inspector', category: 'Debug' }
  ];

  private customHotkeys: Hotkey[] = [];
  private enabledCategories = new Set(['Game Control', 'Buildings', 'Units', 'View', 'Quick Actions', 'Settings']);

  constructor() {
    this.loadCustomHotkeys();
    this.startListening();
  }

  private loadCustomHotkeys() {
    const saved = localStorage.getItem('canvas-castle-fight-hotkeys');
    if (saved) {
      try {
        this.customHotkeys = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load custom hotkeys:', error);
      }
    }
  }

  private saveCustomHotkeys() {
    localStorage.setItem('canvas-castle-fight-hotkeys', JSON.stringify(this.customHotkeys));
  }

  startListening() {
    if (this.isListening) return;

    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      filter(event => this.shouldProcessEvent(event)),
      map(event => this.processKeyEvent(event)),
      filter(hotkeyEvent => hotkeyEvent !== null)
    ).subscribe(hotkeyEvent => {
      this.hotkeyEventSource.next(hotkeyEvent);
    });

    this.isListening = true;
  }

  stopListening() {
    this.isListening = false;
  }

  private shouldProcessEvent(event: KeyboardEvent): boolean {
    // Don't process if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return false;
    }

    // Don't process browser shortcuts
    if (event.ctrlKey && ['s', 'r', 'n', 't', 'w'].includes(event.key.toLowerCase())) {
      return false;
    }

    return true;
  }

  private processKeyEvent(event: KeyboardEvent): HotkeyEvent | null {
    const allHotkeys = [...this.defaultHotkeys, ...this.customHotkeys];
    
    const matchedHotkey = allHotkeys.find(hotkey => 
      this.matchesHotkey(event, hotkey) && 
      this.enabledCategories.has(hotkey.category)
    );

    if (matchedHotkey) {
      event.preventDefault();
      return {
        action: matchedHotkey.action,
        originalEvent: event
      };
    }

    return null;
  }

  private matchesHotkey(event: KeyboardEvent, hotkey: Hotkey): boolean {
    return event.key === hotkey.key &&
           !!event.ctrlKey === !!hotkey.ctrl &&
           !!event.altKey === !!hotkey.alt &&
           !!event.shiftKey === !!hotkey.shift;
  }

  // Public API methods
  getAllHotkeys(): Hotkey[] {
    return [...this.defaultHotkeys, ...this.customHotkeys];
  }

  getHotkeysByCategory(category: string): Hotkey[] {
    return this.getAllHotkeys().filter(h => h.category === category);
  }

  getCategories(): string[] {
    const categories = new Set(this.getAllHotkeys().map(h => h.category));
    return Array.from(categories).sort();
  }

  addCustomHotkey(hotkey: Hotkey): boolean {
    // Check for conflicts
    if (this.hasConflict(hotkey)) {
      return false;
    }

    this.customHotkeys.push(hotkey);
    this.saveCustomHotkeys();
    return true;
  }

  removeCustomHotkey(action: string): boolean {
    const index = this.customHotkeys.findIndex(h => h.action === action);
    if (index >= 0) {
      this.customHotkeys.splice(index, 1);
      this.saveCustomHotkeys();
      return true;
    }
    return false;
  }

  updateHotkey(action: string, newHotkey: Partial<Hotkey>): boolean {
    const hotkey = this.customHotkeys.find(h => h.action === action);
    if (hotkey) {
      Object.assign(hotkey, newHotkey);
      this.saveCustomHotkeys();
      return true;
    }
    return false;
  }

  private hasConflict(newHotkey: Hotkey): boolean {
    return this.getAllHotkeys().some(existing => 
      existing.key === newHotkey.key &&
      !!existing.ctrl === !!newHotkey.ctrl &&
      !!existing.alt === !!newHotkey.alt &&
      !!existing.shift === !!newHotkey.shift &&
      existing.action !== newHotkey.action
    );
  }

  enableCategory(category: string) {
    this.enabledCategories.add(category);
  }

  disableCategory(category: string) {
    this.enabledCategories.delete(category);
  }

  isCategoryEnabled(category: string): boolean {
    return this.enabledCategories.has(category);
  }

  resetToDefaults() {
    this.customHotkeys = [];
    this.saveCustomHotkeys();
  }

  getHotkeyString(hotkey: Hotkey): string {
    const modifiers: string[] = [];
    if (hotkey.ctrl) modifiers.push('Ctrl');
    if (hotkey.alt) modifiers.push('Alt');
    if (hotkey.shift) modifiers.push('Shift');
    
    return [...modifiers, hotkey.key].join(' + ');
  }

  // Convenience methods for common actions
  triggerAction(action: string) {
    this.hotkeyEventSource.next({
      action,
      originalEvent: new KeyboardEvent('keydown')
    });
  }

  // Get description for action
  getActionDescription(action: string): string {
    const hotkey = this.getAllHotkeys().find(h => h.action === action);
    return hotkey?.description || action;
  }

  // Check if action has hotkey
  getHotkeyForAction(action: string): Hotkey | undefined {
    return this.getAllHotkeys().find(h => h.action === action);
  }
}