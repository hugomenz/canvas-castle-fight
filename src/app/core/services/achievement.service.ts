import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'economy' | 'building' | 'survival' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  hidden: boolean;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private achievementsSource = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this.achievementsSource.asObservable();

  private unlockedAchievementsSource = new BehaviorSubject<Achievement[]>([]);
  unlockedAchievements$ = this.unlockedAchievementsSource.asObservable();

  private readonly STORAGE_KEY = 'canvas-castle-fight-achievements';

  private defaultAchievements: Achievement[] = [
    // Combat Achievements
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Destroy your first enemy unit',
      icon: '⚔️',
      category: 'combat',
      difficulty: 'bronze',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      points: 10
    },
    {
      id: 'warrior',
      name: 'Warrior',
      description: 'Destroy 50 enemy units',
      icon: '🛡️',
      category: 'combat',
      difficulty: 'silver',
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      hidden: false,
      points: 25
    },
    {
      id: 'war_master',
      name: 'War Master',
      description: 'Destroy 200 enemy units',
      icon: '👑',
      category: 'combat',
      difficulty: 'gold',
      unlocked: false,
      progress: 0,
      maxProgress: 200,
      hidden: false,
      points: 50
    },
    {
      id: 'untouchable',
      name: 'Untouchable',
      description: 'Win a game without losing any units',
      icon: '🛡️',
      category: 'combat',
      difficulty: 'platinum',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      points: 100
    },

    // Economy Achievements
    {
      id: 'first_harvest',
      name: 'First Harvest',
      description: 'Gather your first 100 wood',
      icon: '🌳',
      category: 'economy',
      difficulty: 'bronze',
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hidden: false,
      points: 10
    },
    {
      id: 'merchant',
      name: 'Merchant',
      description: 'Accumulate 1000 gold',
      icon: '💰',
      category: 'economy',
      difficulty: 'silver',
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
      hidden: false,
      points: 25
    },
    {
      id: 'resource_king',
      name: 'Resource King',
      description: 'Have 2000 of each resource simultaneously',
      icon: '👑',
      category: 'economy',
      difficulty: 'gold',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      points: 75
    },

    // Building Achievements
    {
      id: 'architect',
      name: 'Architect',
      description: 'Build your first structure',
      icon: '🏗️',
      category: 'building',
      difficulty: 'bronze',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      points: 10
    },
    {
      id: 'city_planner',
      name: 'City Planner',
      description: 'Build 25 structures',
      icon: '🏘️',
      category: 'building',
      difficulty: 'silver',
      unlocked: false,
      progress: 0,
      maxProgress: 25,
      hidden: false,
      points: 30
    },
    {
      id: 'empire_builder',
      name: 'Empire Builder',
      description: 'Build 100 structures across all games',
      icon: '🏛️',
      category: 'building',
      difficulty: 'gold',
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hidden: false,
      points: 60
    },

    // Survival Achievements
    {
      id: 'survivor',
      name: 'Survivor',
      description: 'Survive for 10 minutes',
      icon: '⏰',
      category: 'survival',
      difficulty: 'bronze',
      unlocked: false,
      progress: 0,
      maxProgress: 600, // 10 minutes in seconds
      hidden: false,
      points: 20
    },
    {
      id: 'marathon_runner',
      name: 'Marathon Runner',
      description: 'Survive for 1 hour',
      icon: '🏃',
      category: 'survival',
      difficulty: 'gold',
      unlocked: false,
      progress: 0,
      maxProgress: 3600, // 1 hour in seconds
      hidden: false,
      points: 100
    },

    // Special Achievements
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Win a game in under 5 minutes',
      icon: '⚡',
      category: 'special',
      difficulty: 'silver',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: false,
      points: 40
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve a perfect score of 10,000 points',
      icon: '⭐',
      category: 'special',
      difficulty: 'platinum',
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
      hidden: false,
      points: 150
    },
    {
      id: 'dedication',
      name: 'Dedication',
      description: 'Play for a total of 10 hours',
      icon: '🎯',
      category: 'special',
      difficulty: 'gold',
      unlocked: false,
      progress: 0,
      maxProgress: 36000, // 10 hours in seconds
      hidden: false,
      points: 80
    },

    // Hidden Achievements
    {
      id: 'easter_egg',
      name: 'Easter Egg Hunter',
      description: 'Found the secret!',
      icon: '🥚',
      category: 'special',
      difficulty: 'platinum',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      hidden: true,
      points: 200
    }
  ];

  constructor() {
    this.loadAchievements();
  }

  private loadAchievements() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    let achievements = [...this.defaultAchievements];

    if (saved) {
      try {
        const savedAchievements = JSON.parse(saved);
        // Merge saved progress with default achievements
        achievements = achievements.map(defaultAch => {
          const savedAch = savedAchievements.find((s: Achievement) => s.id === defaultAch.id);
          if (savedAch) {
            return {
              ...defaultAch,
              unlocked: savedAch.unlocked,
              unlockedAt: savedAch.unlockedAt ? new Date(savedAch.unlockedAt) : undefined,
              progress: savedAch.progress
            };
          }
          return defaultAch;
        });
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    }

    this.achievementsSource.next(achievements);
    this.updateUnlockedAchievements();
  }

  private saveAchievements() {
    const achievements = this.achievementsSource.value;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(achievements));
  }

  private updateUnlockedAchievements() {
    const achievements = this.achievementsSource.value;
    const unlocked = achievements.filter(a => a.unlocked);
    this.unlockedAchievementsSource.next(unlocked);
  }

  updateProgress(achievementId: string, progress: number) {
    const achievements = this.achievementsSource.value;
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      
      if (achievement.progress >= achievement.maxProgress) {
        this.unlockAchievement(achievementId);
      } else {
        this.achievementsSource.next([...achievements]);
        this.saveAchievements();
      }
    }
  }

  incrementProgress(achievementId: string, amount: number = 1) {
    const achievements = this.achievementsSource.value;
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      const newProgress = achievement.progress + amount;
      this.updateProgress(achievementId, newProgress);
    }
  }

  unlockAchievement(achievementId: string): boolean {
    const achievements = this.achievementsSource.value;
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      achievement.progress = achievement.maxProgress;

      this.achievementsSource.next([...achievements]);
      this.updateUnlockedAchievements();
      this.saveAchievements();

      // Show notification
      this.showAchievementNotification(achievement);
      return true;
    }

    return false;
  }

  private showAchievementNotification(achievement: Achievement) {
    // This could be expanded to show a toast notification
    console.log(`🏆 Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
    
    // Simple browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Achievement Unlocked: ${achievement.name}`, {
        body: achievement.description,
        icon: achievement.icon
      });
    }
  }

  getAchievementsByCategory(category: string): Achievement[] {
    const achievements = this.achievementsSource.value;
    return achievements
      .filter(a => a.category === category && (!a.hidden || a.unlocked))
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return this.getDifficultyOrder(a.difficulty) - this.getDifficultyOrder(b.difficulty);
      });
  }

  private getDifficultyOrder(difficulty: string): number {
    const order = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    return order[difficulty as keyof typeof order] || 0;
  }

  getTotalPoints(): number {
    const achievements = this.achievementsSource.value;
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, a) => total + a.points, 0);
  }

  getCompletionPercentage(): number {
    const achievements = this.achievementsSource.value;
    const visibleAchievements = achievements.filter(a => !a.hidden);
    const unlockedCount = visibleAchievements.filter(a => a.unlocked).length;
    return Math.round((unlockedCount / visibleAchievements.length) * 100);
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  resetAchievements() {
    const resetAchievements = this.defaultAchievements.map(a => ({
      ...a,
      unlocked: false,
      unlockedAt: undefined,
      progress: 0
    }));

    this.achievementsSource.next(resetAchievements);
    this.updateUnlockedAchievements();
    this.saveAchievements();
  }

  // Convenience methods for common achievement updates
  onUnitDestroyed() {
    this.incrementProgress('first_blood');
    this.incrementProgress('warrior');
    this.incrementProgress('war_master');
  }

  onBuildingConstructed() {
    this.incrementProgress('architect');
    this.incrementProgress('city_planner');
    this.incrementProgress('empire_builder');
  }

  onResourceGathered(type: string, amount: number) {
    if (type === 'wood') {
      this.incrementProgress('first_harvest', amount);
    } else if (type === 'gold') {
      this.incrementProgress('merchant', amount);
    }
  }

  onGameTime(seconds: number) {
    this.updateProgress('survivor', seconds);
    this.updateProgress('marathon_runner', seconds);
    this.incrementProgress('dedication', 1);
  }

  onScore(score: number) {
    this.updateProgress('perfectionist', score);
  }

  onGameWon(gameTime: number, unitsLost: number) {
    if (gameTime < 300) { // 5 minutes
      this.unlockAchievement('speed_demon');
    }
    
    if (unitsLost === 0) {
      this.unlockAchievement('untouchable');
    }
  }
}