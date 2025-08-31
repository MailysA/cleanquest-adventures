import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockUserStats } from "@/data/mockData";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";

export default function Profile() {
  const stats = mockUserStats;

  const levelThresholds = {
    apprenti: { min: 0, max: 100, next: 'regulier' },
    regulier: { min: 100, max: 300, next: 'maitre' },
    maitre: { min: 300, max: 600, next: 'sensei' },
    sensei: { min: 600, max: 1000, next: null }
  };

  const currentThreshold = levelThresholds[stats.currentLevel];
  const progressToNext = currentThreshold.next 
    ? ((stats.xp - currentThreshold.min) / (currentThreshold.max - currentThreshold.min)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-3xl sm:text-4xl animate-bounce-in">
            🏆
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">Ton Profil CleanQuest</h1>
          <LevelBadge level={stats.currentLevel} className="mb-4" />
          <div className="text-base sm:text-lg font-semibold">{stats.totalPoints} points au total</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:-mt-6">
        {/* Progression vers le niveau suivant */}
        <Card className="p-4 sm:p-6 mb-6 gradient-card animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold">Progression XP</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentThreshold.next ? `Vers ${currentThreshold.next}` : 'Niveau maximum atteint !'}
              </span>
              <span className="text-xs sm:text-sm font-medium">
                {stats.xp} / {currentThreshold.max} XP
              </span>
            </div>
            <ProgressBar 
              value={stats.xp} 
              max={currentThreshold.max}
              variant="success"
            />
          </div>
          
          {currentThreshold.next && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Plus que {currentThreshold.max - stats.xp} XP pour devenir {currentThreshold.next} !
            </p>
          )}
        </Card>

        {/* Stats de la semaine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatsCard
            title="Points cette semaine"
            value={stats.weeklyPoints}
            icon="⚡"
            trend="up"
            subtitle="+15 vs semaine dernière"
          />
          <StatsCard
            title="Complétude hebdo"
            value={`${stats.weeklyCompletion}%`}
            icon="📊"
            trend={stats.weeklyCompletion >= 70 ? 'up' : 'neutral'}
            subtitle={
              stats.weeklyCompletion >= 90 ? 'Sensei !' :
              stats.weeklyCompletion >= 70 ? 'Maître !' :
              stats.weeklyCompletion >= 40 ? 'Régulier' : 'Apprenti'
            }
          />
        </div>

        {/* Badges */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Badges collectés</h2>
            <Badge variant="secondary">
              {stats.badges.filter(b => b.unlocked).length}/{stats.badges.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border transition-smooth ${
                  badge.unlocked
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${!badge.unlocked && 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${!badge.unlocked && 'text-muted-foreground'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {badge.description}
                    </p>
                    {badge.unlocked && (
                      <Badge className="mt-2 bg-success text-success-foreground">
                        <Trophy className="w-3 h-3 mr-1" />
                        Débloqué
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Statistiques détaillées */}
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Statistiques détaillées</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points totaux</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-success">12</div>
              <div className="text-sm text-muted-foreground">Tâches cette semaine</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-info">7</div>
              <div className="text-sm text-muted-foreground">Jours d'affilée</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-sm text-muted-foreground">Badges débloqués</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}