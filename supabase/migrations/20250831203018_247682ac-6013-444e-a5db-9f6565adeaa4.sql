-- Création de la table pour les couleurs des pièces
CREATE TABLE public.room_colors (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_class TEXT NOT NULL,
  hover_class TEXT NOT NULL,
  hover_selected_class TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Insertion des couleurs par défaut
INSERT INTO public.room_colors (id, name, color_class, hover_class, hover_selected_class, display_order) VALUES
('toutes', 'Toutes', 'bg-muted text-muted-foreground', 'hover:bg-muted/80', 'hover:bg-muted/90', 0),
('cuisine', 'Cuisine', 'bg-orange-500 text-white', 'hover:bg-orange-500/20 hover:text-orange-700 hover:border-orange-300', 'hover:bg-orange-600', 1),
('salon', 'Salon', 'bg-blue-500 text-white', 'hover:bg-blue-500/20 hover:text-blue-700 hover:border-blue-300', 'hover:bg-blue-600', 2),
('salle-de-bain', 'Salle de bain', 'bg-cyan-500 text-white', 'hover:bg-cyan-500/20 hover:text-cyan-700 hover:border-cyan-300', 'hover:bg-cyan-600', 3),
('wc', 'WC', 'bg-teal-500 text-white', 'hover:bg-teal-500/20 hover:text-teal-700 hover:border-teal-300', 'hover:bg-teal-600', 4),
('chambre', 'Chambre', 'bg-purple-500 text-white', 'hover:bg-purple-500/20 hover:text-purple-700 hover:border-purple-300', 'hover:bg-purple-600', 5),
('jardin', 'Jardin', 'bg-green-500 text-white', 'hover:bg-green-500/20 hover:text-green-700 hover:border-green-300', 'hover:bg-green-600', 6),
('buanderie', 'Buanderie', 'bg-indigo-500 text-white', 'hover:bg-indigo-500/20 hover:text-indigo-700 hover:border-indigo-300', 'hover:bg-indigo-600', 7);

-- Activation de RLS
ALTER TABLE public.room_colors ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique des couleurs
CREATE POLICY "Room colors are viewable by everyone" 
ON public.room_colors 
FOR SELECT 
USING (true);

-- Création de la table pour les préférences de filtres utilisateur
CREATE TABLE public.user_filter_preferences (
  id TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  page TEXT NOT NULL, -- 'planning', 'home', etc.
  selected_frequency TEXT DEFAULT 'all',
  selected_room TEXT DEFAULT 'Toutes',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page)
);

-- Activation de RLS
ALTER TABLE public.user_filter_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les préférences utilisateur
CREATE POLICY "Users can view their own filter preferences" 
ON public.user_filter_preferences 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own filter preferences" 
ON public.user_filter_preferences 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own filter preferences" 
ON public.user_filter_preferences 
FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_filter_preferences_updated_at
BEFORE UPDATE ON public.user_filter_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();