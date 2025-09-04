import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Quote, Sparkles } from "lucide-react";

interface KungFuWisdomProps {
  className?: string;
  variant?: 'default' | 'compact' | 'daily';
}

// Sagesses et proverbes kung fu pour l'inspiration
const kungFuWisdoms = [
  {
    text: "La discipline dans le nettoyage forge la discipline de l'esprit.",
    author: "Maître Dragon",
    theme: "discipline"
  },
  {
    text: "Chaque tâche accomplie est un pas vers la maîtrise de soi.",
    author: "Guerrier Tigre", 
    theme: "perseverance"
  },
  {
    text: "L'ordre extérieur reflète la paix intérieure.",
    author: "Phénix Immortel",
    theme: "harmonie"
  },
  {
    text: "Le kung fu du ménage : transformer le chaos en beauté.",
    author: "Jeune Panda",
    theme: "transformation"
  },
  {
    text: "Celui qui maîtrise sa maison maîtrise son destin.",
    author: "Maître Dragon",
    theme: "controle"
  },
  {
    text: "La répétition constante mène à la perfection éternelle.",
    author: "Guerrier Tigre",
    theme: "pratique"
  },
  {
    text: "Dans le silence du nettoyage, l'âme trouve sa voie.",
    author: "Phénix Immortel",
    theme: "meditation"
  },
  {
    text: "Commence petit, pense grand, agis avec constance.",
    author: "Jeune Panda",
    theme: "commencement"
  }
];

const getRandomWisdom = () => {
  return kungFuWisdoms[Math.floor(Math.random() * kungFuWisdoms.length)];
};

const getTodayWisdom = () => {
  // Utilise la date du jour pour avoir la même sagesse toute la journée
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return kungFuWisdoms[dayOfYear % kungFuWisdoms.length];
};

export const KungFuWisdom = ({ className, variant = 'default' }: KungFuWisdomProps) => {
  const wisdom = variant === 'daily' ? getTodayWisdom() : getRandomWisdom();

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200",
        className
      )}>
        <Quote className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm italic text-amber-800 flex-1">
          "{wisdom.text}"
        </p>
      </div>
    );
  }

  return (
    <Card className={cn(
      "p-4 bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200",
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Quote className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
              Sagesse Kung Fu
            </Badge>
          </div>
          
          <blockquote className="text-amber-800 font-medium mb-2 leading-relaxed">
            "{wisdom.text}"
          </blockquote>
          
          <cite className="text-sm text-amber-600 font-medium not-italic">
            — {wisdom.author}
          </cite>
        </div>
      </div>
    </Card>
  );
};

// Composant pour afficher la sagesse du jour
export const DailyKungFuWisdom = ({ className }: { className?: string }) => {
  return (
    <KungFuWisdom 
      variant="daily" 
      className={className}
    />
  );
};

// Hook pour obtenir des sagesses aléatoirement
export const useKungFuWisdom = () => {
  const getWisdom = () => getRandomWisdom();
  const getDailyWisdom = () => getTodayWisdom();
  
  return {
    getWisdom,
    getDailyWisdom,
    allWisdoms: kungFuWisdoms
  };
};
