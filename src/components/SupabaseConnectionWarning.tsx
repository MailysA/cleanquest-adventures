import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, ExternalLink } from "lucide-react";

export const SupabaseConnectionWarning = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center border-warning/20 bg-warning/5">
        <div className="text-6xl mb-4">⚠️</div>
        <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-4">Supabase non configuré</h1>
        
        <p className="text-muted-foreground mb-6">
          Pour utiliser CleanQuest, tu dois d'abord connecter ton projet à Supabase 
          via l'intégration native de Lovable.
        </p>

        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start space-x-3">
            <Database className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-info mb-2">Étapes à suivre :</p>
              <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                <li>Clique sur le bouton <strong>Supabase</strong> (vert) en haut à droite</li>
                <li>Connecte ton compte Supabase ou crée-en un</li>
                <li>L'intégration se fera automatiquement</li>
                <li>Recharge la page une fois connecté</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full gradient-primary hover:opacity-90"
          >
            <Database className="w-4 h-4 mr-2" />
            Recharger la page
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Documentation Supabase
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>
            <strong>Note :</strong> L'intégration Supabase de Lovable configure automatiquement 
            les variables d'environnement nécessaires.
          </p>
        </div>
      </Card>
    </div>
  );
};