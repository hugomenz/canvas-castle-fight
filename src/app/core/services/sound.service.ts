import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SoundSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private settingsSource = new BehaviorSubject<SoundSettings>({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5
  });
  settings$ = this.settingsSource.asObservable();

  private audioContext?: AudioContext;
  private backgroundMusic?: HTMLAudioElement;
  private soundCache = new Map<string, AudioBuffer>();

  constructor() {
    this.loadSettings();
    this.initializeAudioContext();
  }

  private loadSettings() {
    const saved = localStorage.getItem('canvas-castle-fight-sound-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.settingsSource.next(settings);
      } catch (error) {
        console.error('Failed to load sound settings:', error);
      }
    }
  }

  private saveSettings() {
    const settings = this.settingsSource.value;
    localStorage.setItem('canvas-castle-fight-sound-settings', JSON.stringify(settings));
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  updateSettings(newSettings: Partial<SoundSettings>) {
    const current = this.settingsSource.value;
    const updated = { ...current, ...newSettings };
    this.settingsSource.next(updated);
    this.saveSettings();

    // Update background music volume if playing
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = updated.musicEnabled ? updated.musicVolume : 0;
    }
  }

  // Sound effect methods using synthetic audio generation
  playSound(type: 'click' | 'build' | 'attack' | 'victory' | 'defeat' | 'coin' | 'error') {
    const settings = this.settingsSource.value;
    if (!settings.soundEnabled || !this.audioContext) return;

    switch (type) {
      case 'click':
        this.playTone(800, 0.1, 'square', settings.soundVolume * 0.3);
        break;
      case 'build':
        this.playTone(400, 0.3, 'sawtooth', settings.soundVolume * 0.5);
        break;
      case 'attack':
        this.playNoise(0.2, settings.soundVolume * 0.4);
        break;
      case 'victory':
        this.playMelody([523, 659, 784, 1047], 0.2, settings.soundVolume * 0.6);
        break;
      case 'defeat':
        this.playMelody([392, 330, 262, 196], 0.3, settings.soundVolume * 0.6);
        break;
      case 'coin':
        this.playTone(1000, 0.1, 'sine', settings.soundVolume * 0.4);
        setTimeout(() => this.playTone(1200, 0.1, 'sine', settings.soundVolume * 0.4), 100);
        break;
      case 'error':
        this.playTone(200, 0.5, 'square', settings.soundVolume * 0.3);
        break;
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playNoise(duration: number, volume: number = 0.5) {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    source.start(this.audioContext.currentTime);
  }

  private playMelody(frequencies: number[], noteDuration: number, volume: number = 0.5) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, noteDuration, 'sine', volume);
      }, index * noteDuration * 1000);
    });
  }

  // Background music methods (simple ambient sounds)
  startBackgroundMusic() {
    const settings = this.settingsSource.value;
    if (!settings.musicEnabled || !this.audioContext) return;

    this.stopBackgroundMusic();
    this.playAmbientMusic();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = undefined;
    }
  }

  private playAmbientMusic() {
    if (!this.audioContext) return;

    // Create a simple ambient drone with multiple oscillators
    const settings = this.settingsSource.value;
    const volume = settings.musicVolume * 0.1; // Very low volume for ambient

    // Base drone
    this.createAmbientOscillator(110, 'sine', volume);
    this.createAmbientOscillator(165, 'sine', volume * 0.7);
    this.createAmbientOscillator(220, 'sine', volume * 0.5);

    // Add some slow modulation
    setTimeout(() => {
      if (settings.musicEnabled) {
        this.createAmbientOscillator(130, 'triangle', volume * 0.3);
      }
    }, 2000);
  }

  private createAmbientOscillator(frequency: number, type: OscillatorType, volume: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);

    oscillator.start(this.audioContext.currentTime);

    // Slowly modulate frequency for ambient effect
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(frequency * 1.05, this.audioContext.currentTime + 10);
    oscillator.frequency.linearRampToValueAtTime(frequency, this.audioContext.currentTime + 20);
  }

  // Convenience methods for game events
  onBuildingPlaced() {
    this.playSound('build');
  }

  onUnitProduced() {
    this.playSound('click');
  }

  onResourceGained() {
    this.playSound('coin');
  }

  onCombat() {
    this.playSound('attack');
  }

  onVictory() {
    this.playSound('victory');
  }

  onDefeat() {
    this.playSound('defeat');
  }

  onError() {
    this.playSound('error');
  }

  onClick() {
    this.playSound('click');
  }

  // Resume audio context (required after user interaction)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Get current settings
  getCurrentSettings(): SoundSettings {
    return this.settingsSource.value;
  }
}