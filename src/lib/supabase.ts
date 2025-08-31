import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface TaskTemplateRow {
  id: string;
  room: string;
  title: string;
  frequency: string;
  duration_min: number;
  points: number;
  condition: string;
  created_at?: string;
}

export interface UserTaskRow {
  id: string;
  user_id: string;
  template_id: string;
  status: string;
  last_done_at?: string;
  next_due_at: string;
  points: number;
  is_custom: boolean;
  custom_title?: string;
  custom_room?: string;
  custom_duration?: number;
  created_at?: string;
}

export interface UserProfileRow {
  id: string;
  user_id: string;
  housing_type: string;
  family_status: string;
  has_pets: boolean;
  has_garden: boolean;
  current_level: string;
  total_points: number;
  weekly_points: number;
  weekly_completion: number;
  xp: number;
  xp_to_next_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface BadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlocked_at?: string;
  created_at?: string;
}