export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      task_templates: {
        Row: {
          condition: string
          duration_min: number
          frequency: string
          id: string
          points: number
          room: string
          tips: string | null
          title: string
        }
        Insert: {
          condition: string
          duration_min: number
          frequency: string
          id: string
          points: number
          room: string
          tips?: string | null
          title: string
        }
        Update: {
          condition?: string
          duration_min?: number
          frequency?: string
          id?: string
          points?: number
          room?: string
          tips?: string | null
          title?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          description: string | null
          earned_at: string
          id: string
          level: number
          title: string
          user_id: string
        }
        Insert: {
          badge_code: string
          description?: string | null
          earned_at?: string
          id: string
          level?: number
          title: string
          user_id: string
        }
        Update: {
          badge_code?: string
          description?: string | null
          earned_at?: string
          id?: string
          level?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_badges_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          family_status: string | null
          has_children: boolean
          has_garden: boolean
          has_pets: boolean
          home_type: string | null
          level_label: string
          sqm: number | null
          updated_at: string
          user_id: string
          weekly_completion: number
          xp: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          family_status?: string | null
          has_children?: boolean
          has_garden?: boolean
          has_pets?: boolean
          home_type?: string | null
          level_label?: string
          sqm?: number | null
          updated_at?: string
          user_id: string
          weekly_completion?: number
          xp?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          family_status?: string | null
          has_children?: boolean
          has_garden?: boolean
          has_pets?: boolean
          home_type?: string | null
          level_label?: string
          sqm?: number | null
          updated_at?: string
          user_id?: string
          weekly_completion?: number
          xp?: number
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          created_at: string
          duration_min: number
          frequency: string
          id: string
          last_done_at: string | null
          next_due_at: string
          points: number
          room: string
          snooze_count: number
          status: string
          template_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_min: number
          frequency: string
          id: string
          last_done_at?: string | null
          next_due_at: string
          points: number
          room: string
          snooze_count?: number
          status?: string
          template_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_min?: number
          frequency?: string
          id?: string
          last_done_at?: string | null
          next_due_at?: string
          points?: number
          room?: string
          snooze_count?: number
          status?: string
          template_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_tasks_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
