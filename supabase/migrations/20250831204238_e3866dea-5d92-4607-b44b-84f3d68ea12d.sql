-- Créer la table pour les astuces
CREATE TABLE public.tips (
  id TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique des astuces
CREATE POLICY "Tips are viewable by everyone" 
ON public.tips 
FOR SELECT 
USING (is_active = true);

-- Insérer quelques astuces par défaut inspirées des experts
INSERT INTO public.tips (title, content, author, category, display_order) VALUES
('La règle des 5 minutes', 'Si une tâche prend moins de 5 minutes, fais-la immédiatement plutôt que de la reporter. Cela évite l''accumulation de petites corvées.', 'Marie Kondo', 'productivité', 1),
('Ranger avant de nettoyer', 'Commence toujours par ranger et organiser avant de passer l''aspirateur ou de faire la poussière. Tu seras plus efficace !', 'Marie Kondo', 'organisation', 2),
('Une seule chose à la fois', 'Ne commence pas une nouvelle zone avant d''avoir complètement terminé la précédente. La satisfaction du travail fini te motivera.', 'FlyLady', 'motivation', 3),
('Le pouvoir du minuteur', 'Utilise un minuteur de 15 minutes pour chaque tâche. Tu seras surpris de tout ce que tu peux accomplir en si peu de temps !', 'FlyLady', 'productivité', 4),
('Chaque chose à sa place', 'Attribue une place fixe à chaque objet dans ta maison. Le rangement devient alors automatique et naturel.', 'Marie Kondo', 'organisation', 5),
('Nettoyer de haut en bas', 'Commence toujours par les surfaces hautes (étagères, luminaires) et descends vers le sol. La poussière tombe naturellement !', 'Experts ménage', 'technique', 6);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_tips_updated_at
BEFORE UPDATE ON public.tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();