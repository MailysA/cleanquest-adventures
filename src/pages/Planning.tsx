import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/TaskCard";
import { taskTemplates, mockUserTasks } from "@/data/mockData";
import { Calendar, Filter, Clock } from "lucide-react";

const frequencies = [
  { value: 'all', label: 'Toutes', color: 'bg-muted' },
  { value: 'daily', label: 'Quotidiennes', color: 'bg-accent' },
  { value: 'weekly', label: 'Hebdomadaires', color: 'bg-info' },
  { value: 'monthly', label: 'Mensuelles', color: 'bg-primary' },
  { value: 'quarterly', label: 'Trimestrielles', color: 'bg-success' }
];

const rooms = [
  'Toutes',
  'Cuisine',
  'Salon', 
  'Salle de bain',
  'WC',
  'Chambre',
  'Jardin',
  'Buanderie'
];

export default function Planning() {
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('Toutes');

  // Filter tasks based on selections
  const filteredTasks = taskTemplates.filter(task => {
    const frequencyMatch = selectedFrequency === 'all' || task.frequency === selectedFrequency;
    const roomMatch = selectedRoom === 'Toutes' || task.room === selectedRoom;
    return frequencyMatch && roomMatch;
  });

  // Group tasks by frequency
  const tasksByFrequency = {
    daily: filteredTasks.filter(t => t.frequency === 'daily'),
    weekly: filteredTasks.filter(t => t.frequency === 'weekly'),
    monthly: filteredTasks.filter(t => t.frequency === 'monthly'),
    quarterly: filteredTasks.filter(t => t.frequency === 'quarterly')
  };

  const totalDuration = filteredTasks.reduce((sum, task) => sum + task.durationMin, 0);
  const totalPoints = filteredTasks.reduce((sum, task) => sum + task.points, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Planning des tâches</h1>
              <p className="opacity-90">Organise tes missions de nettoyage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{filteredTasks.length}</div>
              <div className="text-sm opacity-90">tâches</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{totalDuration}min</div>
              <div className="text-sm opacity-90">durée totale</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 -mt-6">
        {/* Filtres */}
        <Card className="p-4 mb-6 animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Filtres</h2>
          </div>
          
          {/* Filtre par fréquence */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Fréquence</h3>
            <div className="flex flex-wrap gap-2">
              {frequencies.map((freq) => (
                <Button
                  key={freq.value}
                  variant={selectedFrequency === freq.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFrequency(freq.value)}
                  className={selectedFrequency === freq.value ? "gradient-primary" : ""}
                >
                  {freq.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtre par pièce */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Pièce</h3>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Button
                  key={room}
                  variant={selectedRoom === room ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRoom(room)}
                  className={selectedRoom === room ? "gradient-primary" : ""}
                >
                  {room}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Statistiques filtrées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 gradient-card">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📋</div>
              <div>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
                <div className="text-sm text-muted-foreground">Tâches</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 gradient-card">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-info" />
              <div>
                <div className="text-2xl font-bold">{totalDuration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 gradient-card">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⭐</div>
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points max</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tâches par fréquence */}
        {selectedFrequency === 'all' ? (
          <div className="space-y-6">
            {Object.entries(tasksByFrequency).map(([frequency, tasks]) => {
              if (tasks.length === 0) return null;
              
              const freqConfig = frequencies.find(f => f.value === frequency);
              
              return (
                <div key={frequency} className="animate-fade-in">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className={freqConfig?.color}>
                      {freqConfig?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Aucune tâche trouvée</h3>
            <p className="text-muted-foreground">
              Essaie de modifier tes filtres pour voir plus de tâches.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}