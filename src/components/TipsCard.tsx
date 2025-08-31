import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupabaseService } from "@/services/supabaseService";
import { Lightbulb, ChevronRight, User } from "lucide-react";

interface Tip {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
}

export const TipsCard = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      const data = await SupabaseService.getTips(6); // Charger plus d'astuces pour la rotation
      setTips(data);
    } catch (error) {
      console.error('Error loading tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-accent animate-pulse" />
          <h3 className="text-lg font-bold">Chargement des astuces...</h3>
        </div>
      </Card>
    );
  }

  if (tips.length === 0) {
    return null;
  }

  const currentTip = tips[currentTipIndex];

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold">Astuce d'expert</h3>
          <Badge variant="secondary" className="text-xs">
            {currentTipIndex + 1}/{tips.length}
          </Badge>
        </div>
        {tips.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-8 w-8 p-0 hover:bg-accent/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-primary">{currentTip.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentTip.content}
        </p>
        <div className="flex items-center space-x-2 pt-2">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-accent">{currentTip.author}</span>
          <Badge variant="outline" className="text-xs">
            {currentTip.category}
          </Badge>
        </div>
      </div>
    </Card>
  );
};