import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, Target } from "lucide-react";

export const InfoCard = () => {
  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 animate-fade-in h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Le saviez-vous ?</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="flex items-start space-x-3">
          <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Temps quotidien moyen</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              Les experts recommandent <span className="font-semibold text-primary">15-30 minutes</span> de ménage par jour 
              pour maintenir une maison propre sans stress.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Target className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Inspiré des meilleurs</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              CleanQuest s'inspire des méthodes de <span className="font-semibold text-accent">Marie Kondo</span>, 
              <span className="font-semibold text-accent"> FlyLady</span> et autres experts en organisation.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-muted/20 mt-auto">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              3-8 tâches/jour
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Méthode scientifique
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};