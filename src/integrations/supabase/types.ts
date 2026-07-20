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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          category: string
          company_id: string
          confidence: number | null
          created_at: string
          estimated_annual_saving_usd: number | null
          estimated_co2e_saving_tonnes: number | null
          id: string
          insight: string
          priority: string
          recommendation: string | null
        }
        Insert: {
          category?: string
          company_id: string
          confidence?: number | null
          created_at?: string
          estimated_annual_saving_usd?: number | null
          estimated_co2e_saving_tonnes?: number | null
          id?: string
          insight: string
          priority?: string
          recommendation?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          confidence?: number | null
          created_at?: string
          estimated_annual_saving_usd?: number | null
          estimated_co2e_saving_tonnes?: number | null
          id?: string
          insight?: string
          priority?: string
          recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue_usd: number | null
          company_name: string
          created_at: string
          employees: number
          id: string
          industry: string
          location: string
          net_zero_target_year: number | null
          sustainability_target: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_revenue_usd?: number | null
          company_name: string
          created_at?: string
          employees?: number
          id?: string
          industry: string
          location: string
          net_zero_target_year?: number | null
          sustainability_target?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_revenue_usd?: number | null
          company_name?: string
          created_at?: string
          employees?: number
          id?: string
          industry?: string
          location?: string
          net_zero_target_year?: number | null
          sustainability_target?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_twin: {
        Row: {
          carbon_level: number
          company_id: string
          energy_efficiency: number
          id: string
          prediction: string | null
          sustainability_score: number
          updated_at: string
        }
        Insert: {
          carbon_level?: number
          company_id: string
          energy_efficiency?: number
          id?: string
          prediction?: string | null
          sustainability_score?: number
          updated_at?: string
        }
        Update: {
          carbon_level?: number
          company_id?: string
          energy_efficiency?: number
          id?: string
          prediction?: string | null
          sustainability_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_records: {
        Row: {
          calculation_date: string
          carbon_tonnes: number
          company_id: string
          created_at: string
          emission_type: string
          id: string
          scope: string
          source: string | null
        }
        Insert: {
          calculation_date?: string
          carbon_tonnes?: number
          company_id: string
          created_at?: string
          emission_type: string
          id?: string
          scope?: string
          source?: string | null
        }
        Update: {
          calculation_date?: string
          carbon_tonnes?: number
          company_id?: string
          created_at?: string
          emission_type?: string
          id?: string
          scope?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_records: {
        Row: {
          company_id: string
          created_at: string
          electricity_kwh: number
          fuel_liters: number
          id: string
          record_date: string
          renewable_kwh: number
        }
        Insert: {
          company_id: string
          created_at?: string
          electricity_kwh?: number
          fuel_liters?: number
          id?: string
          record_date: string
          renewable_kwh?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          electricity_kwh?: number
          fuel_liters?: number
          id?: string
          record_date?: string
          renewable_kwh?: number
        }
        Relationships: [
          {
            foreignKeyName: "energy_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          link: string | null
          message: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          message: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          custom_fields: Json | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          manager_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          manager_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          manager_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string
          generated_date: string
          id: string
          period_label: string | null
          report_name: string
          report_type: string
          status: string
          storage_path: string | null
        }
        Insert: {
          company_id: string
          generated_date?: string
          id?: string
          period_label?: string | null
          report_name: string
          report_type?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          company_id?: string
          generated_date?: string
          id?: string
          period_label?: string | null
          report_name?: string
          report_type?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_data: {
        Row: {
          company_id: string
          confidence_score: number | null
          error_message: string | null
          extracted_data: Json | null
          extracted_text: string | null
          file_name: string
          file_size_bytes: number | null
          file_type: string
          id: string
          mime_type: string | null
          processed_at: string | null
          processing_status: string
          storage_path: string | null
          uploaded_at: string
        }
        Insert: {
          company_id: string
          confidence_score?: number | null
          error_message?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          mime_type?: string | null
          processed_at?: string | null
          processing_status?: string
          storage_path?: string | null
          uploaded_at?: string
        }
        Update: {
          company_id?: string
          confidence_score?: number | null
          error_message?: string | null
          extracted_data?: Json | null
          extracted_text?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          mime_type?: string | null
          processed_at?: string | null
          processing_status?: string
          storage_path?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_manager_profile_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_of: {
        Args: { _employee_user_id: string; _manager_user_id: string }
        Returns: boolean
      }
      seed_demo_data: { Args: { admin_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "manager" | "employee"
      approval_action: "approved" | "rejected" | "change_requested"
      approver_type: "manager" | "admin"
      request_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
        | "change_requested"
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
    Enums: {
      app_role: ["admin", "manager", "employee"],
      approval_action: ["approved", "rejected", "change_requested"],
      approver_type: ["manager", "admin"],
      request_status: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "change_requested",
      ],
    },
  },
} as const
