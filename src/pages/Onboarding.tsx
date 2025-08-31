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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 gradient-hero bg-clip-text text-transparent leading-tight">
            CleanQuest
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Personnalise ton expérience de nettoyage en quelques questions
          </p>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="mt-4 text-muted-foreground hover:text-primary text-sm"
          >
            Passer les questions →
          </Button>
        </div>

        <Card className="p-4 sm:p-6 gradient-card animate-slide-up">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Question {currentStep + 1} sur {questions.length}
              </span>
              <div className="flex space-x-1">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-smooth ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-6 leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className="w-full justify-start p-4 sm:p-5 h-auto hover:border-primary/50 hover:bg-primary/5 transition-smooth min-h-[60px] sm:min-h-[70px] active:scale-[0.98]"
                onClick={() => handleAnswer(option.value)}
              >
                <span className="text-2xl sm:text-3xl mr-3 flex-shrink-0">{option.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm sm:text-base">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {option.subtitle}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {isLastStep && (
            <div className="mt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                Clique sur ton niveau pour lancer ton aventure !
              </p>
            </div>
          )}
        </Card>

        {currentStep > 0 && (
          <div className="mt-4 text-center animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-muted-foreground hover:text-foreground min-h-[44px] px-6"
            >
              ← Retour
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}