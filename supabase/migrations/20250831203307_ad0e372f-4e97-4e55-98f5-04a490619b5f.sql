-- Créer la fonction manquante pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les tables créées précédemment si elles existent
DROP TABLE IF EXISTS public.user_filter_preferences CASCADE;
DROP TABLE IF EXISTS public.room_colors CASCADE;