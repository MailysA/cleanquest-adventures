-- CleanQuest Database Schema
-- Execute this SQL in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security
ALTER TABLE IF EXISTS task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;

-- Create task_templates table (global templates for all users)
CREATE TABLE IF NOT EXISTS task_templates (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    title TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    duration_min INTEGER NOT NULL,
    points INTEGER NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('none', 'petsOnly', 'gardenOnly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    housing_type TEXT NOT NULL CHECK (housing_type IN ('house', 'apartment', 'student')),
    family_status TEXT NOT NULL CHECK (family_status IN ('single', 'parent')),
    has_pets BOOLEAN NOT NULL DEFAULT FALSE,
    has_garden BOOLEAN NOT NULL DEFAULT FALSE,
    current_level TEXT NOT NULL CHECK (current_level IN ('apprenti', 'regulier', 'maitre', 'sensei')),
    total_points INTEGER NOT NULL DEFAULT 0,
    weekly_points INTEGER NOT NULL DEFAULT 0,
    weekly_completion INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_tasks table
CREATE TABLE IF NOT EXISTS user_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id TEXT REFERENCES task_templates(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'snoozed')),
    last_done_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    condition TEXT NOT NULL,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_next_due_at ON user_tasks(next_due_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked ON user_badges(unlocked);

-- Row Level Security Policies

-- task_templates: Everyone can read (global templates)
CREATE POLICY "Anyone can view task templates" ON task_templates
    FOR SELECT USING (true);

-- user_profiles: Users can only see/modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- user_tasks: Users can only see/modify their own tasks
CREATE POLICY "Users can view own tasks" ON user_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON user_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON user_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- user_badges: Users can only see/modify their own badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON user_badges
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample task templates if they don't exist
INSERT INTO task_templates (id, room, title, frequency, duration_min, points, condition) VALUES
('cuisine-vaisselle', 'Cuisine', 'Vaisselle / plans de travail', 'daily', 10, 5, 'none'),
('cuisine-frigo-check', 'Cuisine', 'Réfrigérateur (vérifier aliments)', 'weekly', 10, 10, 'none'),
('cuisine-frigo-deep', 'Cuisine', 'Réfrigérateur (nettoyage complet)', 'monthly', 30, 20, 'none'),
('salon-aspirateur', 'Salon', 'Aspirateur', 'weekly', 20, 15, 'none'),
('salon-aspirateur-animaux', 'Salon', 'Aspirateur (poils animaux)', 'daily', 15, 20, 'petsOnly'),
('sdb-vasque', 'Salle de bain', 'Lavabo + miroir', 'weekly', 10, 10, 'none'),
('sdb-douche', 'Salle de bain', 'Douche / baignoire', 'weekly', 20, 15, 'none'),
('wc-cuvette', 'WC', 'Nettoyage cuvette + lunette', 'weekly', 10, 10, 'none'),
('chambre-draps', 'Chambre', 'Changer les draps', 'weekly', 15, 10, 'none'),
('chambre-matelas', 'Chambre', 'Retourner / aspirer le matelas', 'quarterly', 20, 20, 'none'),
('jardin-tonte', 'Jardin', 'Tondre la pelouse', 'weekly', 30, 25, 'gardenOnly'),
('linge-lavmachine', 'Buanderie', 'Cycle entretien lave-linge', 'monthly', 60, 25, 'none')
ON CONFLICT (id) DO NOTHING;