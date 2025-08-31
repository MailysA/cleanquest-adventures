import { TaskTemplate, UserTask, UserProfile, UserStats, Badge } from '../types/game';

export const taskTemplates: TaskTemplate[] = [
  {
    id: "cuisine-vaisselle",
    room: "Cuisine",
    title: "Vaisselle / plans de travail",
    frequency: "daily",
    durationMin: 10,
    points: 5,
    condition: "none"
  },
  {
    id: "cuisine-frigo-check",
    room: "Cuisine",
    title: "Réfrigérateur (vérifier aliments)",
    frequency: "weekly",
    durationMin: 10,
    points: 10,
    condition: "none"
  },
  {
    id: "cuisine-frigo-deep",
    room: "Cuisine",
    title: "Réfrigérateur (nettoyage complet)",
    frequency: "monthly",
    durationMin: 30,
    points: 20,
    condition: "none"
  },
  {
    id: "salon-aspirateur",
    room: "Salon",
    title: "Aspirateur",
    frequency: "weekly",
    durationMin: 20,
    points: 15,
    condition: "none"
  },
  {
    id: "salon-aspirateur-animaux",
    room: "Salon",
    title: "Aspirateur (poils animaux)",
    frequency: "daily",
    durationMin: 15,
    points: 20,
    condition: "petsOnly"
  },
  {
    id: "sdb-vasque",
    room: "Salle de bain",
    title: "Lavabo + miroir",
    frequency: "weekly",
    durationMin: 10,
    points: 10,
    condition: "none"
  },
  {
    id: "sdb-douche",
    room: "Salle de bain",
    title: "Douche / baignoire",
    frequency: "weekly",
    durationMin: 20,
    points: 15,
    condition: "none"
  },
  {
    id: "wc-cuvette",
    room: "WC",
    title: "Nettoyage cuvette + lunette",
    frequency: "weekly",
    durationMin: 10,
    points: 10,
    condition: "none"
  },
  {
    id: "chambre-draps",
    room: "Chambre",
    title: "Changer les draps",
    frequency: "weekly",
    durationMin: 15,
    points: 10,
    condition: "none"
  },
  {
    id: "jardin-tonte",
    room: "Jardin",
    title: "Tondre la pelouse",
    frequency: "weekly",
    durationMin: 30,
    points: 25,
    condition: "gardenOnly"
  }
];

export const mockUserProfile: UserProfile = {
  id: "user1",
  housingType: "apartment",
  familyStatus: "single",
  hasPets: false,
  hasGarden: false,
  currentLevel: "regulier"
};

export const mockUserTasks: UserTask[] = [
  {
    id: "task1",
    userId: "user1",
    templateId: "cuisine-vaisselle",
    status: "pending",
    nextDueAt: new Date(),
    points: 5
  },
  {
    id: "task2",
    userId: "user1",
    templateId: "salon-aspirateur",
    status: "pending",
    nextDueAt: new Date(),
    points: 15
  },
  {
    id: "task3",
    userId: "user1",
    templateId: "sdb-vasque",
    status: "done",
    lastDoneAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextDueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    points: 10
  }
];

export const mockBadges: Badge[] = [
  {
    id: "frigo-hero",
    name: "Héros du frigo",
    description: "Nettoyer le frigo 5 fois",
    icon: "🧊",
    condition: "Clean fridge 5 times",
    unlocked: true
  },
  {
    id: "cuisine-master",
    name: "Maître de cuisine",
    description: "Compléter 20 tâches de cuisine",
    icon: "👨‍🍳",
    condition: "Complete 20 kitchen tasks",
    unlocked: false
  },
  {
    id: "weekly-champion",
    name: "Champion hebdo",
    description: "100% des tâches complétées cette semaine",
    icon: "🏆",
    condition: "100% weekly completion",
    unlocked: false
  }
];

export const mockUserStats: UserStats = {
  totalPoints: 245,
  weeklyPoints: 75,
  weeklyCompletion: 65,
  currentLevel: "regulier",
  xp: 250,
  xpToNextLevel: 150,
  badges: mockBadges
};