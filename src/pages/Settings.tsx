import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/LevelBadge";
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseService } from "@/services/supabaseService";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  RefreshCw, 
  Mail,
  Home,
  Users,
  PawPrint,
  Trees,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: true,
    achievements: true
  });
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userData = await SupabaseService.getUserData(user.id);
      if (userData.profile) {
        setProfile({
          housingType: userData.profile.home_type || 'apartment',
          familyStatus: userData.profile.family_status || 'single', 
          hasPets: userData.profile.has_pets || false,
          hasGarden: userData.profile.has_garden || false,
          currentLevel: userData.profile.level_label || 'apprenti'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileUpdate = async (field: string, value: any) => {
    if (!user || !profile) return;

    try {
      const updates: any = {};
      
      // Map frontend fields to database fields
      switch (field) {
        case 'housingType':
          updates.home_type = value;
          break;
        case 'familyStatus':
          updates.family_status = value;
          break;
        case 'hasPets':
          updates.has_pets = value;
          break;
        case 'hasGarden':
          updates.has_garden = value;
          break;
        case 'currentLevel':
          updates.level_label = value;
          break;
      }

      await SupabaseService.updateUserProfile(user.id, updates);
      
      // Update local state
      setProfile(prev => ({ ...prev, [field]: value }));
      
      toast({
        title: "Profil mis à jour",
        description: "Tes préférences ont été sauvegardées !",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les changements",
        variant: "destructive"
      });
    }
  };

  const handleResetProgress = () => {
    toast({
      title: "Progression réinitialisée",
      description: "Ton aventure CleanQuest recommence à zéro !",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">Paramètres</h1>
              <p className="opacity-90 text-sm sm:text-base">Personnalise ton expérience CleanQuest</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:-mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-bounce"></div>
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        ) : profile ? (
          <>
            {/* Profil utilisateur */}
            <Card className="p-4 sm:p-6 mb-6 gradient-card animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold">Mon profil</h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Type de logement */}
            <div>
              <h3 className="font-medium mb-2 flex items-center space-x-2 text-sm sm:text-base">
                <Home className="w-4 h-4" />
                <span>Type de logement</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'house', label: 'Maison', icon: '🏠' },
                  { value: 'apartment', label: 'Appartement', icon: '🏢' },
                  { value: 'student', label: 'Logement étudiant', icon: '🎓' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={profile.housingType === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleProfileUpdate('housingType', option.value)}
                    className={`${profile.housingType === option.value ? "gradient-primary" : ""} min-h-[40px] text-xs sm:text-sm`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Situation familiale */}
            <div>
              <h3 className="font-medium mb-2 flex items-center space-x-2 text-sm sm:text-base">
                <Users className="w-4 h-4" />
                <span>Situation familiale</span>
              </h3>
              <div className="flex gap-2">
                {[
                  { value: 'single', label: 'Célibataire', icon: '👤' },
                  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={profile.familyStatus === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleProfileUpdate('familyStatus', option.value)}
                    className={`${profile.familyStatus === option.value ? "gradient-primary" : ""} min-h-[40px] text-xs sm:text-sm flex-1 sm:flex-none`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options avec switch */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <PawPrint className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Animaux domestiques</span>
                </div>
                <Switch
                  checked={profile.hasPets}
                  onCheckedChange={(checked) => handleProfileUpdate('hasPets', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Trees className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Jardin/Extérieur</span>
                </div>
                <Switch
                  checked={profile.hasGarden}
                  onCheckedChange={(checked) => handleProfileUpdate('hasGarden', checked)}
                />
              </div>
            </div>

            {/* Niveau actuel */}
            <div>
              <h3 className="font-medium mb-2 text-sm sm:text-base">Niveau actuel</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'apprenti', label: 'Apprenti' },
                  { value: 'regulier', label: 'Régulier' },
                  { value: 'maitre', label: 'Maître' }
                ].map((level) => (
                  <Button
                    key={level.value}
                    variant={profile.currentLevel === level.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleProfileUpdate('currentLevel', level.value)}
                    className={`${profile.currentLevel === level.value ? "gradient-primary" : ""} min-h-[40px] text-xs sm:text-sm`}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
              <div className="mt-2">
                <LevelBadge level={profile.currentLevel} />
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Rappel quotidien</h3>
                <p className="text-sm text-muted-foreground">
                  Notification pour tes tâches du jour
                </p>
              </div>
              <Switch
                checked={notifications.daily}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, daily: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Rappel hebdomadaire</h3>
                <p className="text-sm text-muted-foreground">
                  Bilan de ta semaine et objectifs
                </p>
              </div>
              <Switch
                checked={notifications.weekly}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, weekly: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Succès et badges</h3>
                <p className="text-sm text-muted-foreground">
                  Notification lors de nouveaux badges
                </p>
              </div>
              <Switch
                checked={notifications.achievements}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, achievements: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Google Calendar Sync */}
        <GoogleCalendarSync className="mb-6 animate-fade-in" />

        {/* Actions */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Actions</h2>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleResetProgress}
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser ma progression
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground border-border hover:bg-muted/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </Card>

        {/* Support */}
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Support</h2>
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Besoin d'aide ou une suggestion ? Contacte-nous !
            </p>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Contacter le support
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p>CleanQuest v1.0</p>
              <p>Connecté en tant que {user?.email}</p>
              <p className="mt-2">Créé avec ❤️ pour rendre le ménage amusant</p>
            </div>
          </div>
        </Card>
        </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erreur lors du chargement du profil</p>
            <Button onClick={loadUserProfile} className="mt-4">
              Réessayer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}