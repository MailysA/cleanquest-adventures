export interface TaskTemplate {
  id: string;
  room: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  durationMin: number;
  points: number;
  condition: 'none' | 'petsOnly' | 'gardenOnly';
  isCustom?: boolean;
}

export interface UserTask {
  id: string;
  userId: string;
  templateId: string;
  status: 'pending' | 'done' | 'snoozed';
  lastDoneAt?: Date;
  nextDueAt: Date;
  points: number;
  isCustom?: boolean;
  customTitle?: string;
}

export interface UserProfile {
  id: string;
  housingType: 'house' | 'apartment' | 'student';
  familyStatus: 'single' | 'parent';
  hasPets: boolean;
  hasGarden: boolean;
  currentLevel: 'apprenti' | 'regulier' | 'maitre' | 'sensei';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
}

export interface UserStats {
  totalPoints: number;
  weeklyPoints: number;
  weeklyCompletion: number;
  currentLevel: 'apprenti' | 'regulier' | 'maitre' | 'sensei';
  xp: number;
  xpToNextLevel: number;
  badges: Badge[];
}