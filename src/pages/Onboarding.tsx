import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

const questions = [
  {
    id: 'housingType',
    question: 'Tu vis dans :',
    options: [
      { value: 'house', label: 'Maison', icon: '🏠' },
      { value: 'apartment', label: 'Appartement', icon: '🏢' },
      { value: 'student', label: 'Logement étudiant', icon: '🎓' }
    ]
  },
  {
    id: 'familyStatus',
    question: 'Tu es :',
    options: [
      { value: 'single', label: 'Célibataire', icon: '👤' },
      { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧' }
    ]
  },
  {
    id: 'hasPets',
    question: 'As-tu des animaux ?',
    options: [
      { value: true, label: 'Oui', icon: '🐶' },
      { value: false, label: 'Non', icon: '❌' }
    ]
  },
  {
    id: 'hasGarden',
    question: 'As-tu un jardin ou extérieur ?',
    options: [
      { value: true, label: 'Oui', icon: '🌳' },
      { value: false, label: 'Non', icon: '❌' }
    ]
  },
  {
    id: 'currentLevel',
    question: 'Ton niveau actuel :',
    options: [
      { value: 'apprenti', label: 'Apprenti du ménage', icon: '🌱', subtitle: 'je débute' },
      { value: 'regulier', label: 'Régulier', icon: '⚡', subtitle: 'j\'ai des habitudes mais pas stables' },
      { value: 'maitre', label: 'Maître en devenir', icon: '⭐', subtitle: 'j\'aime être carré' }
    ]
  }
];

const defaultProfile: Partial<UserProfile> = {
  housingType: 'apartment',
  familyStatus: 'single',
  hasPets: false,
  hasGarden: false,
  currentLevel: 'regulier'
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleAnswer = async (value: any) => {
    const newProfile = { ...profile, [currentQuestion.id]: value };
    setProfile(newProfile);

    if (isLastStep) {
      await saveProfileAndRedirect(newProfile);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const saveProfileAndRedirect = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder le profil",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mapper les données du profil vers le format de la base de données
      const dbProfileData = {
        home_type: profileData.housingType || 'apartment',
        family_status: profileData.familyStatus || 'single',
        has_pets: profileData.hasPets || false,
        has_garden: profileData.hasGarden || false,
        level_label: profileData.currentLevel || 'apprenti'
      };

      await SupabaseService.updateUserProfile(user.id, dbProfileData);
      
      // Sauvegarder aussi localement pour la compatibilité
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      toast({
        title: "Profil créé !",
        description: "Bienvenue dans CleanQuest !",
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await saveProfileAndRedirect(defaultProfile);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-light mb-3 text-foreground">
            CleanQuest
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentStep + 1} / {questions.length}
          </p>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="mt-6 text-xs text-muted-foreground hover:text-primary"
          >
            {isLoading ? "Sauvegarde..." : "Passer →"}
          </Button>
        </div>

        <div className="bg-card rounded-xl p-8 border border-border/50 animate-slide-up">
          <h2 className="text-xl font-medium mb-8 text-center leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className="w-full justify-start p-6 h-auto hover:border-primary transition-smooth min-h-[64px] rounded-lg"
                onClick={() => handleAnswer(option.value)}
                disabled={isLoading}
              >
                <span className="text-2xl mr-4">{option.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {option.subtitle}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {currentStep > 0 && (
          <div className="mt-8 text-center animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              ← Retour
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}