import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddCustomTaskDialogProps {
  onAddTask: (task: {
    title: string;
    room: string;
    durationMin: number;
    points: number;
  }) => void;
}

const rooms = [
  'Cuisine',
  'Salon', 
  'Salle de bain',
  'WC',
  'Chambre',
  'Jardin',
  'Buanderie',
  'Bureau',
  'Garage',
  'Autre'
];

export const AddCustomTaskDialog = ({ onAddTask }: AddCustomTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState(15);
  const [points, setPoints] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !room) return;

    onAddTask({
      title: title.trim(),
      room,
      durationMin: duration,
      points
    });

    // Reset form
    setTitle('');
    setRoom('');
    setDuration(15);
    setPoints(5);
    setOpen(false);
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    // Auto-calculate points based on duration (limited to max 5 points)
    const calculatedPoints = Math.min(5, Math.max(1, Math.round(value / 5)));
    setPoints(calculatedPoints);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une tâche
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <span>Créer une tâche personnalisée</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Nom de la tâche *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nettoyer les vitres"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="room">Pièce *</Label>
            <Select value={room} onValueChange={setRoom} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choisir une pièce" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((roomOption) => (
                  <SelectItem key={roomOption} value={roomOption}>
                    {roomOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Durée (min)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="5"
                value={points}
                onChange={(e) => setPoints(Math.min(5, Number(e.target.value)))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-muted/20 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Astuce :</strong> Les points sont automatiquement calculés selon la durée (max 5 points), 
              mais tu peux les ajuster selon la difficulté de la tâche.
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !room}
              className="flex-1 gradient-primary hover:opacity-90"
            >
              Créer la tâche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};