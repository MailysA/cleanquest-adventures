import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/TaskCard";
import { AddCustomTaskDialog } from "@/components/AddCustomTaskDialog";
import { useUserTasks } from "@/hooks/useUserTasks";
import { taskTemplates } from "@/data/mockData";
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
  
  const { 
    tasks, 
    templates, 
    loading, 
    completeTask, 
    snoozeTask, 
    deleteTask, 
    addCustomTask,
    canExecuteEarly 
  } = useUserTasks();

  // Combine templates with custom tasks for filtering
  const allTasks = [
    ...tasks.map(task => {
      const template = templates.find(t => t.id === task.templateId);
      return {
        task: template || {
          id: 'custom',
          room: 'Autre',
          title: task.customTitle || 'Tâche personnalisée',
          frequency: 'daily' as const,
          durationMin: 15,
          points: task.points,
          condition: 'none' as const,
          isCustom: true
        },
        userTask: task
      };
    }),
    // Add available templates that don't have active user tasks
    ...templates
      .filter(template => !tasks.some(task => task.templateId === template.id))
      .map(template => ({ task: template, userTask: null }))
  ];

  // Filter tasks based on selections
  const filteredItems = allTasks.filter(item => {
    const frequencyMatch = selectedFrequency === 'all' || item.task.frequency === selectedFrequency;
    const roomMatch = selectedRoom === 'Toutes' || item.task.room === selectedRoom;
    return frequencyMatch && roomMatch;
  });

  // Group tasks by frequency
  const tasksByFrequency = {
    daily: filteredItems.filter(item => item.task.frequency === 'daily'),
    weekly: filteredItems.filter(item => item.task.frequency === 'weekly'),
    monthly: filteredItems.filter(item => item.task.frequency === 'monthly'),
    quarterly: filteredItems.filter(item => item.task.frequency === 'quarterly')
  };

  const totalDuration = filteredItems.reduce((sum, item) => sum + item.task.durationMin, 0);
  const totalPoints = filteredItems.reduce((sum, item) => sum + item.task.points, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-bounce"></div>
          <p className="text-muted-foreground">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero text-primary-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">Planning des tâches</h1>
              <p className="opacity-90 text-sm sm:text-base">Organise tes missions de nettoyage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-base sm:text-lg font-bold">{filteredItems.length}</div>
              <div className="text-xs sm:text-sm opacity-90">tâches</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-base sm:text-lg font-bold">{totalDuration}min</div>
              <div className="text-xs sm:text-sm opacity-90">durée totale</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:-mt-6">
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
                <div className="text-2xl font-bold">{filteredItems.length}</div>
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

        {/* Bouton pour ajouter une tâche personnalisée */}
        <div className="mb-6">
          <AddCustomTaskDialog onAddTask={addCustomTask} />
        </div>

        {/* Tâches par fréquence */}
        {selectedFrequency === 'all' ? (
          <div className="space-y-6">
            {Object.entries(tasksByFrequency).map(([frequency, items]) => {
              if (items.length === 0) return null;
              
              const freqConfig = frequencies.find(f => f.value === frequency);
              
              return (
                <div key={frequency} className="animate-fade-in">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className={freqConfig?.color}>
                      {freqConfig?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {items.length} tâche{items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <TaskCard 
                        key={item.userTask?.id || item.task.id} 
                        task={item.task}
                        userTask={item.userTask || undefined}
                        status={item.userTask?.status || 'pending'}
                        onComplete={item.userTask ? () => completeTask(item.userTask.id) : undefined}
                        onSnooze={item.userTask ? () => snoozeTask(item.userTask.id) : undefined}
                        onDelete={item.userTask ? () => deleteTask(item.userTask.id) : undefined}
                        canExecuteEarly={
                          item.userTask && item.task 
                            ? canExecuteEarly(item.userTask, item.task) 
                            : false
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredItems.map((item) => (
              <TaskCard 
                key={item.userTask?.id || item.task.id} 
                task={item.task}
                userTask={item.userTask || undefined}
                status={item.userTask?.status || 'pending'}
                onComplete={item.userTask ? () => completeTask(item.userTask.id) : undefined}
                onSnooze={item.userTask ? () => snoozeTask(item.userTask.id) : undefined}
                onDelete={item.userTask ? () => deleteTask(item.userTask.id) : undefined}
                canExecuteEarly={
                  item.userTask && item.task 
                    ? canExecuteEarly(item.userTask, item.task) 
                    : false
                }
              />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Aucune tâche trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Essaie de modifier tes filtres ou ajoute une tâche personnalisée.
            </p>
            <AddCustomTaskDialog onAddTask={addCustomTask} />
          </Card>
        )}
      </div>
    </div>
  );
}