import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.component.html',
  styleUrl: './tutorial.component.scss'
})
export class TutorialComponent {
  @Output() closeTutorial = new EventEmitter<void>();

  currentStep = 0;
  showTutorial = true;

  tutorialSteps = [
    {
      title: 'Welcome to Canvas Castle Fight!',
      content: 'This is a real-time strategy game where you build an army and fight to destroy the enemy castle.',
      image: '🏰',
      highlight: ''
    },
    {
      title: 'Resources',
      content: 'You have four resources: Wood (🌳), Food (🍗), Gold (💰), and Upgrade points (🌟). These automatically increase over time.',
      image: '💰',
      highlight: 'top-bar'
    },
    {
      title: 'Building Structures',
      content: 'Click on buildings in the bottom panel to select them, then click on the battlefield to place them.',
      image: '🏗️',
      highlight: 'bottom-bar'
    },
    {
      title: 'Unit Production',
      content: 'Use the Unit Production panel on the left to create military units that will automatically march toward the enemy.',
      image: '⚔️',
      highlight: 'left-sidebar'
    },
    {
      title: 'Victory Conditions',
      content: 'Destroy the enemy castle to win! You can also win by achieving certain goals like survival time or resource collection.',
      image: '🏆',
      highlight: ''
    },
    {
      title: 'Game Settings',
      content: 'Use the settings panel on the right to enable AI opponent, save/load games, and adjust difficulty.',
      image: '⚙️',
      highlight: 'right-sidebar'
    },
    {
      title: 'Ready to Play!',
      content: 'You\'re ready to start playing! Good luck conquering your enemies!',
      image: '🎮',
      highlight: ''
    }
  ];

  nextStep() {
    if (this.currentStep < this.tutorialSteps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  skipTutorial() {
    this.showTutorial = false;
    this.closeTutorial.emit();
    localStorage.setItem('canvas-castle-fight-tutorial-seen', 'true');
  }

  completeTutorial() {
    this.showTutorial = false;
    this.closeTutorial.emit();
    localStorage.setItem('canvas-castle-fight-tutorial-seen', 'true');
  }

  getCurrentStep() {
    return this.tutorialSteps[this.currentStep];
  }

  isLastStep() {
    return this.currentStep === this.tutorialSteps.length - 1;
  }

  isFirstStep() {
    return this.currentStep === 0;
  }

  shouldShowTutorial(): boolean {
    return localStorage.getItem('canvas-castle-fight-tutorial-seen') !== 'true';
  }
}
