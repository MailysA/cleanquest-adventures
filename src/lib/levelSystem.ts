// Système unifié de niveaux avec personnages pour CleanQuest

export interface LevelCharacter {
  id: string;
  name: string;
  emoji: string;
  avatar: string;
  description: string;
  personalityTrait: string;
  catchPhrase: string;
  unlockMessage: string;
  backgroundColor: string;
  borderColor: string;
  glowColor: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  minXP: number;
  maxXP: number;
  character: LevelCharacter;
  badgeClass: string;
  nextLevel?: string;
}

// Personnages du kung fu pour chaque niveau
export const levelCharacters: Record<string, LevelCharacter> = {
  apprenti: {
    id: 'apprenti',
    name: 'Jeune Panda',
    emoji: '🐼',
    avatar: '👶',
    description: 'Un apprenti kung fu enthousiaste qui apprend les bases du nettoyage',
    personalityTrait: 'Énergique et déterminé',
    catchPhrase: '"Chaque mouvement compte, chaque tâche enseigne !"',
    unlockMessage: 'Bienvenue dans le dojo CleanQuest ! Le Jeune Panda va t\'enseigner les premières formes.',
    backgroundColor: 'from-green-100 to-green-200',
    borderColor: 'border-green-300',
    glowColor: 'shadow-green-200'
  },
  regulier: {
    id: 'regulier',
    name: 'Guerrier Tigre',
    emoji: '🐅',
    avatar: '👨‍🔧',
    description: 'Un combattant aguerri qui maîtrise les techniques intermédiaires',
    personalityTrait: 'Discipliné et puissant',
    catchPhrase: '"La force vient de la répétition, la maîtrise de la constance !"',
    unlockMessage: 'Excellent ! Le Guerrier Tigre reconnaît ta progression. Tu as gagné en force et technique !',
    backgroundColor: 'from-orange-100 to-orange-200',
    borderColor: 'border-orange-300',
    glowColor: 'shadow-orange-200'
  },
  maitre: {
    id: 'maitre',
    name: 'Maître Dragon',
    emoji: '🐉',
    avatar: '🧙���♂️',
    description: 'Le sage maître qui connaît tous les secrets des arts martiaux du nettoyage',
    personalityTrait: 'Sage et mystique',
    catchPhrase: '"L\'harmonie parfaite entre l\'esprit et l\'action !"',
    unlockMessage: 'Incroyable ! Le Maître Dragon t\'accepte comme disciple avancé. Tu comprends maintenant l\'essence du kung fu !',
    backgroundColor: 'from-red-100 to-red-200',
    borderColor: 'border-red-300',
    glowColor: 'shadow-red-200'
  },
  legende: {
    id: 'legende',
    name: 'Phénix Immortel',
    emoji: '🔥',
    avatar: '🌟',
    description: 'L\'être légendaire qui transcende tous les arts martiaux et atteint l\'illumination',
    personalityTrait: 'Transcendant et éternel',
    catchPhrase: '"Par le feu de la purification, l\'âme atteint la perfection !"',
    unlockMessage: 'LÉGENDAIRE ! Le Phénix Immortel renaît pour te guider. Tu as atteint l\'illumination martiale !',
    backgroundColor: 'from-amber-100 to-yellow-200',
    borderColor: 'border-amber-300',
    glowColor: 'shadow-amber-200'
  }
};

// Configuration des niveaux kung fu
export const levelConfigs: Record<string, LevelConfig> = {
  apprenti: {
    id: 'apprenti',
    name: 'Novice',
    minXP: 0,
    maxXP: 200,
    character: levelCharacters.apprenti,
    badgeClass: 'bg-green-500 text-white',
    nextLevel: 'regulier'
  },
  regulier: {
    id: 'regulier',
    name: 'Guerrier',
    minXP: 200,
    maxXP: 600,
    character: levelCharacters.regulier,
    badgeClass: 'bg-orange-500 text-white',
    nextLevel: 'maitre'
  },
  maitre: {
    id: 'maitre',
    name: 'Maître',
    minXP: 600,
    maxXP: 1200,
    character: levelCharacters.maitre,
    badgeClass: 'bg-red-500 text-white',
    nextLevel: 'legende'
  },
  legende: {
    id: 'legende',
    name: 'Immortel',
    minXP: 1200,
    maxXP: Infinity,
    character: levelCharacters.legende,
    badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    nextLevel: undefined
  }
};

// Utilitaires pour le système de niveaux
export class LevelSystem {
  
  // Calculer le niveau basé sur l'XP
  static calculateLevel(xp: number): string {
    for (const [levelId, config] of Object.entries(levelConfigs)) {
      if (xp >= config.minXP && xp < config.maxXP) {
        return levelId;
      }
    }
    return 'legende'; // Par défaut si XP très élevé
  }
  
  // Obtenir la configuration d'un niveau
  static getLevelConfig(levelId: string): LevelConfig | null {
    return levelConfigs[levelId] || null;
  }
  
  // Calculer l'XP nécessaire pour le prochain niveau
  static getXpToNextLevel(currentXp: number): number {
    const currentLevel = this.calculateLevel(currentXp);
    const config = levelConfigs[currentLevel];
    
    if (!config || !config.nextLevel) {
      return 0; // Niveau maximum atteint
    }
    
    return config.maxXP - currentXp;
  }
  
  // Calculer le pourcentage de progression vers le prochain niveau
  static getLevelProgress(currentXp: number): number {
    const currentLevel = this.calculateLevel(currentXp);
    const config = levelConfigs[currentLevel];
    
    if (!config) return 100;
    
    const progress = ((currentXp - config.minXP) / (config.maxXP - config.minXP)) * 100;
    return Math.min(100, Math.max(0, progress));
  }
  
  // Vérifier si un niveau up a eu lieu
  static checkLevelUp(oldXP: number, newXP: number): string | null {
    const oldLevel = this.calculateLevel(oldXP);
    const newLevel = this.calculateLevel(newXP);
    
    if (oldLevel !== newLevel) {
      return newLevel;
    }
    
    return null;
  }
  
  // Obtenir le personnage pour un niveau donné
  static getCharacter(levelId: string): LevelCharacter | null {
    return levelCharacters[levelId] || null;
  }
  
  // Obtenir tous les niveaux disponibles
  static getAllLevels(): LevelConfig[] {
    return Object.values(levelConfigs);
  }
  
  // Calculer les points bonus selon le niveau
  static getLevelBonus(levelId: string): number {
    switch (levelId) {
      case 'apprenti':
        return 0;
      case 'regulier':
        return 1;
      case 'maitre':
        return 2;
      case 'legende':
        return 3;
      default:
        return 0;
    }
  }
  
  // Formatage des nombres avec séparateurs
  static formatXP(xp: number): string {
    return new Intl.NumberFormat('fr-FR').format(xp);
  }
  
  // Messages d'encouragement selon le niveau (thème kung fu)
  static getEncouragementMessage(levelId: string, progress: number): string {
    const character = this.getCharacter(levelId);
    if (!character) return '';

    if (progress < 25) {
      return `${character.name}: "Le voyage de mille li commence par un pas !"`;
    } else if (progress < 50) {
      return `${character.name}: "Ton chi se renforce, continue l'entraînement !"`;
    } else if (progress < 75) {
      return `${character.name}: "La maîtrise est proche, ne faiblis pas !"`;
    } else {
      return `${character.name}: "Ton kung fu s'améliore ! Le prochain niveau t'appelle !"`;
    }
  }
}

// Export par défaut pour faciliter l'importation
export default LevelSystem;
