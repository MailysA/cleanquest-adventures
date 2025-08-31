import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const InitializeDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const handleInitializeData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Tu dois être connecté pour initialiser les données",
          variant: "destructive"
        });
        return;
      }

      // Initialiser les données mockées
      await SupabaseService.initializeMockData(user.id);
      
      setInitialized(true);
      toast({
        title: "Données initialisées ! 🎉",
        description: "Tes tâches et ton profil ont été créés en base de données",
      });
      
      // Recharger la page après 2 secondes pour voir les nouvelles données
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser les données. Vérifie ta connexion Supabase.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialized) {
    return (
      <Card className="p-6 gradient-card border-success/20 animate-fade-in">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Données initialisées !</h3>
          <p className="text-muted-foreground">
            Tes tâches et ton profil sont maintenant en base de données.
            La page va se recharger automatiquement...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 gradient-card border-primary/20 animate-slide-up">
      <div className="text-center">
        <Database className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Initialiser la base de données</h3>
        <p className="text-muted-foreground mb-6">
          Injecte les données mockées (tâches, profil, badges) dans ta base Supabase
        </p>
        
        <Button 
          onClick={handleInitializeData}
          disabled={loading}
          className="gradient-primary hover:opacity-90 text-lg px-8 py-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Initialisation en cours...
            </>
          ) : (
            <>
              <Database className="w-5 h-5 mr-2" />
              Injecter les données
            </>
          )}
        </Button>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Assure-toi que Supabase est bien connecté
        </div>
      </div>
    </Card>
  );
};