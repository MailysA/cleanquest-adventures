import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockUserStats } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseService } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, TrendingUp, Award, Camera, Upload, User, BarChart, Target } from "lucide-react";

export default function Profile() {
  const stats = mockUserStats;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const userData = await SupabaseService.getUserData(user.id);
      if (userData.profile?.avatar_url) {
        setAvatarUrl(userData.profile.avatar_url);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur", 
        description: "L'image doit faire moins de 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting parameter
      const timestamp = Date.now();
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrlWithCacheBust = `${data.publicUrl}?t=${timestamp}`;

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrlWithCacheBust })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrlWithCacheBust);
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour !",
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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
          {/* Avatar Section */}
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/20 overflow-hidden flex items-center justify-center animate-bounce-in">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
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
            icon={<Star className="w-5 h-5" />}
            trend="up"
            subtitle="+15 vs semaine dernière"
          />
          <StatsCard
            title="Complétude hebdo"
            value={`${stats.weeklyCompletion}%`}
            icon={<BarChart className="w-5 h-5" />}
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