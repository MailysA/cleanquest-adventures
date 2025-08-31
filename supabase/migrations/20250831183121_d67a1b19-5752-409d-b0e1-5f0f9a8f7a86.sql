-- Add annual frequency to task templates
UPDATE task_templates 
SET frequency = 'annual' 
WHERE frequency = 'quarterly' AND title LIKE '%grand%' OR title LIKE '%annuel%';

-- Insert some annual tasks examples
INSERT INTO task_templates (id, title, room, frequency, duration_min, points, condition, category)
VALUES 
  ('annual-deep-clean', 'Grand nettoyage de printemps', 'Salon', 'annual', 240, 100, 'none', 'maintenance'),
  ('annual-garden-prep', 'Préparation du jardin pour l''hiver', 'Jardin', 'annual', 180, 80, 'gardenOnly', 'maintenance'),
  ('annual-windows', 'Nettoyage complet des vitres', 'Salon', 'annual', 120, 60, 'none', 'hygiene')
ON CONFLICT (id) DO NOTHING;