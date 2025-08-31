import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserProfile } from "@/types/game";

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
  const navigate = useNavigate();

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleAnswer = (value: any) => {
    const newProfile = { ...profile, [currentQuestion.id]: value };
    setProfile(newProfile);

    if (isLastStep) {
      // Save profile and redirect
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
      navigate('/home');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    // Save default profile and redirect
    localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    navigate('/home');
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
            className="mt-6 text-xs text-muted-foreground hover:text-primary"
          >
            Passer →
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