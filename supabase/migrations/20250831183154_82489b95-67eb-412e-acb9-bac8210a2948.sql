-- Insert annual tasks with correct categories
INSERT INTO task_templates (id, title, room, frequency, duration_min, points, condition, category)
VALUES 
  ('annual-deep-clean', 'Grand nettoyage de printemps', 'Salon', 'annual', 240, 100, 'none', 'hygiene'),
  ('annual-garden-prep', 'Préparation du jardin pour l''hiver', 'Jardin', 'annual', 180, 80, 'gardenOnly', 'optimisation'),
  ('annual-windows', 'Nettoyage complet des vitres', 'Salon', 'annual', 120, 60, 'none', 'hygiene')
ON CONFLICT (id) DO NOTHING;