export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string | null
          message: string
          priority: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message: string
          priority?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_analysis: {
        Row: {
          away_form_score: number | null
          confidence_level: string
          created_at: string
          current_odds: number
          ev_percentage: number
          head_to_head_score: number | null
          home_form_score: number | null
          id: string
          injury_impact_score: number | null
          match_id: string | null
          rating: number | null
          recommendation: string
          recommended_odds: number
          under_45_probability: number
          updated_at: string
          weather_condition: string | null
        }
        Insert: {
          away_form_score?: number | null
          confidence_level?: string
          created_at?: string
          current_odds: number
          ev_percentage: number
          head_to_head_score?: number | null
          home_form_score?: number | null
          id?: string
          injury_impact_score?: number | null
          match_id?: string | null
          rating?: number | null
          recommendation?: string
          recommended_odds: number
          under_45_probability: number
          updated_at?: string
          weather_condition?: string | null
        }
        Update: {
          away_form_score?: number | null
          confidence_level?: string
          created_at?: string
          current_odds?: number
          ev_percentage?: number
          head_to_head_score?: number | null
          home_form_score?: number | null
          id?: string
          injury_impact_score?: number | null
          match_id?: string | null
          rating?: number | null
          recommendation?: string
          recommended_odds?: number
          under_45_probability?: number
          updated_at?: string
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_analysis_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_metrics: {
        Row: {
          corners_away: number | null
          corners_home: number | null
          dangerous_attacks: number | null
          id: string
          match_id: string | null
          possession_away: number | null
          possession_home: number | null
          shots_away: number | null
          shots_home: number | null
          shots_on_target_away: number | null
          shots_on_target_home: number | null
          updated_at: string
          xg_away: number | null
          xg_home: number | null
          xg_total: number | null
        }
        Insert: {
          corners_away?: number | null
          corners_home?: number | null
          dangerous_attacks?: number | null
          id?: string
          match_id?: string | null
          possession_away?: number | null
          possession_home?: number | null
          shots_away?: number | null
          shots_home?: number | null
          shots_on_target_away?: number | null
          shots_on_target_home?: number | null
          updated_at?: string
          xg_away?: number | null
          xg_home?: number | null
          xg_total?: number | null
        }
        Update: {
          corners_away?: number | null
          corners_home?: number | null
          dangerous_attacks?: number | null
          id?: string
          match_id?: string | null
          possession_away?: number | null
          possession_home?: number | null
          shots_away?: number | null
          shots_home?: number | null
          shots_on_target_away?: number | null
          shots_on_target_home?: number | null
          updated_at?: string
          xg_away?: number | null
          xg_home?: number | null
          xg_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_metrics_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_team: string
          created_at: string
          home_team: string
          id: string
          kickoff_time: string
          league: string
          minute: number | null
          score_away: number | null
          score_home: number | null
          status: string
          total_goals: number | null
          updated_at: string
        }
        Insert: {
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          kickoff_time: string
          league: string
          minute?: number | null
          score_away?: number | null
          score_home?: number | null
          status?: string
          total_goals?: number | null
          updated_at?: string
        }
        Update: {
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          kickoff_time?: string
          league?: string
          minute?: number | null
          score_away?: number | null
          score_home?: number | null
          status?: string
          total_goals?: number | null
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
