import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/TaskCard";
import { AddCustomTaskDialog } from "@/components/AddCustomTaskDialog";
import { useUserTasks } from "@/hooks/useUserTasks";
import { taskTemplates } from "@/data/mockData";
import { Calendar, Filter, Clock, ClipboardList, Star, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const frequencies = [
  { value: 'all', label: 'Toutes', color: 'bg-muted' },
  { value: 'daily', label: 'Quotidiennes', color: 'bg-accent' },
  { value: 'weekly', label: 'Hebdomadaires', color: 'bg-info' },
  { value: 'monthly', label: 'Mensuelles', color: 'bg-primary' },
  { value: 'quarterly', label: 'Trimestrielles', color: 'bg-success' },
  { value: 'yearly', label: 'Annuelles', color: 'bg-warning' }
];

const rooms = [
  { name: 'Toutes', color: 'bg-muted text-muted-foreground', hover: 'hover:bg-muted/80', hoverSelected: 'hover:bg-muted/90' },
  { name: 'Cuisine', color: 'bg-orange-500 text-white', hover: 'hover:bg-orange-500/20 hover:text-orange-700 hover:border-orange-300', hoverSelected: 'hover:bg-orange-600' },
  { name: 'Salon', color: 'bg-blue-500 text-white', hover: 'hover:bg-blue-500/20 hover:text-blue-700 hover:border-blue-300', hoverSelected: 'hover:bg-blue-600' }, 
  { name: 'Salle de bain', color: 'bg-cyan-500 text-white', hover: 'hover:bg-cyan-500/20 hover:text-cyan-700 hover:border-cyan-300', hoverSelected: 'hover:bg-cyan-600' },
  { name: 'WC', color: 'bg-teal-500 text-white', hover: 'hover:bg-teal-500/20 hover:text-teal-700 hover:border-teal-300', hoverSelected: 'hover:bg-teal-600' },
  { name: 'Chambre', color: 'bg-purple-500 text-white', hover: 'hover:bg-purple-500/20 hover:text-purple-700 hover:border-purple-300', hoverSelected: 'hover:bg-purple-600' },
  { name: 'Jardin', color: 'bg-green-500 text-white', hover: 'hover:bg-green-500/20 hover:text-green-700 hover:border-green-300', hoverSelected: 'hover:bg-green-600' },
  { name: 'Buanderie', color: 'bg-indigo-500 text-white', hover: 'hover:bg-indigo-500/20 hover:text-indigo-700 hover:border-indigo-300', hoverSelected: 'hover:bg-indigo-600' }
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
    addTemplateToToday,
    removeFromToday,
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
      .filter(template => !tasks.some(task => task.templateId === template.id && task.status === 'due'))
      .map(template => ({ task: template, userTask: null }))
  ];
  
  // Séparer les tâches par status pour l'affichage
  const dueTasks = allTasks.filter(item => !item.userTask || item.userTask.status === 'due');
  const snoozedTasks = allTasks.filter(item => item.userTask && item.userTask.status === 'snoozed');
  const doneTasks = allTasks.filter(item => item.userTask && item.userTask.status === 'done');
  
  // Fonction pour changer la fréquence et ajuster automatiquement la pièce
  const handleFrequencyChange = (frequency: string) => {
    setSelectedFrequency(frequency);
    
    if (frequency !== 'all') {
      // Récupérer les pièces disponibles pour cette fréquence
      const tasksForFrequency = allTasks.filter(item => item.task.frequency === frequency);
      const roomsForFrequency = [...new Set(tasksForFrequency.map(item => item.task.room))];
      
      // Si une seule pièce, la sélectionner automatiquement
      if (roomsForFrequency.length === 1) {
        setSelectedRoom(roomsForFrequency[0]);
      } else if (roomsForFrequency.length > 1) {
        // Si plusieurs pièces, garder "Toutes" pour voir toutes les tâches
        setSelectedRoom('Toutes');
      }
    } else {
      // Pour "all", remettre sur "Toutes"
      setSelectedRoom('Toutes');
    }
  };

  // Filter tasks based on selections - now include all statuses
  const filteredDueTasks = dueTasks.filter(item => {
    const frequencyMatch = selectedFrequency === 'all' || item.task.frequency === selectedFrequency;
    const roomMatch = selectedRoom === 'Toutes' || item.task.room === selectedRoom;
    return frequencyMatch && roomMatch;
  });

  const filteredSnoozedTasks = snoozedTasks.filter(item => {
    const frequencyMatch = selectedFrequency === 'all' || item.task.frequency === selectedFrequency;
    const roomMatch = selectedRoom === 'Toutes' || item.task.room === selectedRoom;
    return frequencyMatch && roomMatch;
  });

  const filteredDoneTasks = doneTasks.filter(item => {
    const frequencyMatch = selectedFrequency === 'all' || item.task.frequency === selectedFrequency;
    const roomMatch = selectedRoom === 'Toutes' || item.task.room === selectedRoom;
    return frequencyMatch && roomMatch;
  });

  const allFilteredTasks = [...filteredDueTasks, ...filteredSnoozedTasks, ...filteredDoneTasks];

  // Group tasks by frequency - only for due tasks
  const tasksByFrequency = {
    daily: filteredDueTasks.filter(item => item.task.frequency === 'daily'),
    weekly: filteredDueTasks.filter(item => item.task.frequency === 'weekly'),
    monthly: filteredDueTasks.filter(item => item.task.frequency === 'monthly'),
    quarterly: filteredDueTasks.filter(item => item.task.frequency === 'quarterly'),
    yearly: filteredDueTasks.filter(item => item.task.frequency === 'yearly')
  };

  const totalDuration = allFilteredTasks.reduce((sum, item) => sum + item.task.durationMin, 0);
  const totalPoints = allFilteredTasks.reduce((sum, item) => sum + item.task.points, 0);

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
              <div className="text-base sm:text-lg font-bold">{allFilteredTasks.length}</div>
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
                  onClick={() => handleFrequencyChange(freq.value)}
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
              {rooms.map((roomObj) => (
                <Button
                  key={roomObj.name}
                  variant={selectedRoom === roomObj.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRoom(roomObj.name)}
                  className={cn(
                    selectedRoom === roomObj.name 
                      ? `${roomObj.color} ${roomObj.hoverSelected} border-0` 
                      : `${roomObj.hover}`,
                    "transition-all duration-200"
                  )}
                >
                  {roomObj.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Statistiques filtrées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 gradient-card">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              <div>
              <div>
                <div className="text-2xl font-bold">{allFilteredTasks.length}</div>
                <div className="text-sm text-muted-foreground">Tâches</div>
              </div>
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
              <Star className="w-6 h-6 text-warning" />
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
            {/* Tâches à faire */}
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
                        status={item.userTask?.status || 'due'}
                        onComplete={item.userTask ? () => completeTask(item.userTask.id) : undefined}
                        onSnooze={item.userTask ? () => snoozeTask(item.userTask.id) : undefined}
                        onDelete={item.userTask ? () => deleteTask(item.userTask.id) : undefined}
                        onAddToToday={!item.userTask ? () => addTemplateToToday(item.task.id) : undefined}
                        onRemoveFromToday={item.userTask && item.task.frequency !== 'daily' ? () => removeFromToday(item.userTask.id) : undefined}
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
            
            {/* Tâches reportées */}
            {filteredSnoozedTasks.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-warning text-warning-foreground">
                    Reportées
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {filteredSnoozedTasks.length} tâche{filteredSnoozedTasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3 opacity-75">
                  {filteredSnoozedTasks.map((item) => (
                    <TaskCard 
                      key={item.userTask.id} 
                      task={item.task}
                      userTask={item.userTask}
                      status={item.userTask.status}
                      onComplete={() => completeTask(item.userTask.id)}
                      onSnooze={() => snoozeTask(item.userTask.id)}
                      onDelete={() => deleteTask(item.userTask.id)}
                      canExecuteEarly={canExecuteEarly(item.userTask, item.task)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Tâches terminées */}
            {filteredDoneTasks.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-success text-success-foreground">
                    Terminées
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {filteredDoneTasks.length} tâche{filteredDoneTasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3 opacity-60">
                  {filteredDoneTasks.map((item) => (
                    <TaskCard 
                      key={item.userTask.id} 
                      task={item.task}
                      userTask={item.userTask}
                      status={item.userTask.status}
                      onComplete={() => completeTask(item.userTask.id)}
                      onSnooze={() => snoozeTask(item.userTask.id)}
                      onDelete={() => deleteTask(item.userTask.id)}
                      canExecuteEarly={canExecuteEarly(item.userTask, item.task)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Tâches à faire */}
            {filteredDueTasks.length > 0 && (
              <div className="space-y-3">
                {filteredDueTasks.map((item) => (
                  <TaskCard 
                    key={item.userTask?.id || item.task.id} 
                    task={item.task}
                    userTask={item.userTask || undefined}
                    status={item.userTask?.status || 'due'}
                    onComplete={item.userTask ? () => completeTask(item.userTask.id) : undefined}
                    onSnooze={item.userTask ? () => snoozeTask(item.userTask.id) : undefined}
                    onDelete={item.userTask ? () => deleteTask(item.userTask.id) : undefined}
                    onAddToToday={!item.userTask ? () => addTemplateToToday(item.task.id) : undefined}
                    onRemoveFromToday={item.userTask && item.task.frequency !== 'daily' ? () => removeFromToday(item.userTask.id) : undefined}
                    canExecuteEarly={
                      item.userTask && item.task 
                        ? canExecuteEarly(item.userTask, item.task) 
                        : false
                    }
                  />
                ))}
              </div>
            )}
            
            {/* Tâches reportées */}
            {filteredSnoozedTasks.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-warning text-warning-foreground">
                    Reportées
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {filteredSnoozedTasks.length} tâche{filteredSnoozedTasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3 opacity-75">
                  {filteredSnoozedTasks.map((item) => (
                    <TaskCard 
                      key={item.userTask.id} 
                      task={item.task}
                      userTask={item.userTask}
                      status={item.userTask.status}
                      onComplete={() => completeTask(item.userTask.id)}
                      onSnooze={() => snoozeTask(item.userTask.id)}
                      onDelete={() => deleteTask(item.userTask.id)}
                      canExecuteEarly={canExecuteEarly(item.userTask, item.task)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Tâches terminées */}
            {filteredDoneTasks.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-success text-success-foreground">
                    Terminées
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {filteredDoneTasks.length} tâche{filteredDoneTasks.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3 opacity-60">
                  {filteredDoneTasks.map((item) => (
                    <TaskCard 
                      key={item.userTask.id} 
                      task={item.task}
                      userTask={item.userTask}
                      status={item.userTask.status}
                      onComplete={() => completeTask(item.userTask.id)}
                      onSnooze={() => snoozeTask(item.userTask.id)}
                      onDelete={() => deleteTask(item.userTask.id)}
                      canExecuteEarly={canExecuteEarly(item.userTask, item.task)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {allFilteredTasks.length === 0 && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
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