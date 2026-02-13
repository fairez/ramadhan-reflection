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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      doa_entries: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          entry_date: string
          id: string
          pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          pinned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      itikaf_rows: {
        Row: {
          day_number: number
          id: string
          lokasi: string | null
          target: string | null
          teman: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          day_number?: number
          id?: string
          lokasi?: string | null
          target?: string | null
          teman?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          day_number?: number
          id?: string
          lokasi?: string | null
          target?: string | null
          teman?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      letter_for_me: {
        Row: {
          content: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          profession: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          profession?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          profession?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quran_journal_entries: {
        Row: {
          ayah_ref: string | null
          content: string | null
          created_at: string
          entry_date: string
          id: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_ref?: string | null
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_ref?: string | null
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          ramadhan_start_date: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ramadhan_start_date?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ramadhan_start_date?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tadabbur_weeks: {
        Row: {
          apply_to_life: string | null
          ayat: string | null
          id: string
          reflection: string | null
          tafsir: string | null
          updated_at: string
          user_id: string
          waktu: string | null
          week_number: number
        }
        Insert: {
          apply_to_life?: string | null
          ayat?: string | null
          id?: string
          reflection?: string | null
          tafsir?: string | null
          updated_at?: string
          user_id: string
          waktu?: string | null
          week_number: number
        }
        Update: {
          apply_to_life?: string | null
          ayat?: string | null
          id?: string
          reflection?: string | null
          tafsir?: string | null
          updated_at?: string
          user_id?: string
          waktu?: string | null
          week_number?: number
        }
        Relationships: []
      }
      tracker_checks: {
        Row: {
          checked: boolean
          day_number: number
          habit_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          day_number: number
          habit_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked?: boolean
          day_number?: number
          habit_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_checks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "tracker_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_habits: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
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
