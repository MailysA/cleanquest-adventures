import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Calendar, CheckCircle, AlertCircle, ExternalLink, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleCalendarSyncProps {
  className?: string;
}

export const GoogleCalendarSync = ({ className }: GoogleCalendarSyncProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const { toast } = useToast();

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    
    try {
      // Simuler la connexion OAuth Google
      // En vrai, on utiliserait Google OAuth2
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast({
        title: "Google Calendar connecté ! 🎉",
        description: "Tu peux maintenant synchroniser tes tâches",
      });
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSyncEnabled(false);
    toast({
      title: "Google Calendar déconnecté",
      description: "La synchronisation a été désactivée",
    });
  };

  const handleToggleSync = (enabled: boolean) => {
    setSyncEnabled(enabled);
    toast({
      title: enabled ? "Synchronisation activée" : "Synchronisation désactivée",
      description: enabled 
        ? "Tes tâches CleanQuest apparaîtront dans Google Calendar" 
        : "La synchronisation automatique est arrêtée",
    });
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Synchronisation Google Calendar</h3>
        {isConnected && (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        )}
      </div>

      <p className="text-muted-foreground mb-6">
        Synchronise automatiquement tes tâches CleanQuest avec ton agenda Google Calendar 
        pour ne jamais oublier tes missions de nettoyage.
      </p>

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info mb-1">Fonctionnalités de synchronisation :</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Création automatique d'événements pour tes tâches</li>
                  <li>• Rappels avant l'échéance des tâches</li>
                  <li>• Synchronisation bidirectionnelle (CleanQuest ↔ Google)</li>
                  <li>• Couleurs personnalisées par type de tâche</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConnectGoogleCalendar}
            disabled={isConnecting}
            className="w-full gradient-primary hover:opacity-90"
          >
            {isConnecting ? (
              <LoadingSpinner size="sm" text="Connexion en cours..." />
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Se connecter à Google Calendar
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status connecté */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">Connexion établie</p>
                <p className="text-sm text-muted-foreground">
                  Connecté à : user@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Options de synchronisation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Synchronisation automatique</h4>
                <p className="text-sm text-muted-foreground">
                  Créer des événements pour tes tâches CleanQuest
                </p>
              </div>
              <Switch
                checked={syncEnabled}
                onCheckedChange={handleToggleSync}
              />
            </div>

            {syncEnabled && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent mb-1">Synchronisation active !</p>
                    <p className="text-muted-foreground text-xs">
                      Tes prochaines tâches apparaîtront automatiquement dans ton Google Calendar 
                      avec des rappels 30 minutes avant l'heure prévue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                Déconnecter Google Calendar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Note technique */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Note :</strong> Cette fonctionnalité nécessite l'autorisation d'accès à ton Google Calendar. 
          Tes données restent privées et ne sont utilisées que pour la synchronisation.
        </p>
      </div>
    </Card>
  );
};