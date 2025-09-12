export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          full_name: string
          email: string
          phone: string
          country: string
          education_level: string
          work_experience: string
          motivation: string
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          full_name: string
          email: string
          phone: string
          country: string
          education_level: string
          work_experience: string
          motivation: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          full_name?: string
          email?: string
          phone?: string
          country?: string
          education_level?: string
          work_experience?: string
          motivation?: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          duration: string
          level: string
          requirements: string[]
          learning_outcomes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          duration: string
          level: string
          requirements: string[]
          learning_outcomes: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          duration?: string
          level?: string
          requirements?: string[]
          learning_outcomes?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          content: string
          video_url: string | null
          duration_minutes: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description: string
          content: string
          video_url?: string | null
          duration_minutes: number
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string
          content?: string
          video_url?: string | null
          duration_minutes?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          certification_id: string
          title: string
          description: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certification_id: string
          title: string
          description: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certification_id?: string
          title?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_enrollments: {
        Row: {
          id: string
          user_id: string
          certification_id: string
          status: "enrolled" | "in_progress" | "completed" | "cancelled"
          progress: number
          enrolled_at: string
          completed_at: string | null
          certificate_issued: boolean
          certificate_url: string | null
          payment_status: "pending" | "completed" | "failed" | "refunded"
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certification_id: string
          status?: "enrolled" | "in_progress" | "completed" | "cancelled"
          progress?: number
          enrolled_at?: string
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          payment_status?: "pending" | "completed" | "failed" | "refunded"
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certification_id?: string
          status?: "enrolled" | "in_progress" | "completed" | "cancelled"
          progress?: number
          enrolled_at?: string
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_url?: string | null
          payment_status?: "pending" | "completed" | "failed" | "refunded"
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          country: string | null
          education_level: string | null
          work_experience: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          education_level?: string | null
          work_experience?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string | null
          education_level?: string | null
          work_experience?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Additional type definitions for the application
export interface UserEnrollment extends Tables<"user_enrollments"> {
  certification?: Tables<"certifications">
}

export interface Application extends Tables<"applications"> {
  certification?: Tables<"certifications">
}

export interface UserProfile extends Tables<"user_profiles"> {}

export interface Certification extends Tables<"certifications"> {
  modules?: Module[]
}

export interface Module extends Tables<"modules"> {
  lessons?: Lesson[]
}

export interface Lesson extends Tables<"lessons"> {}

// Dashboard data types
export interface DashboardStats {
  totalEnrollments: number
  activeEnrollments: number
  completedCertifications: number
  pendingApplications: number
}

export interface EnrollmentWithCertification {
  id: string
  certification_id: string
  status: "enrolled" | "in_progress" | "completed" | "cancelled"
  progress: number
  enrolled_at: string
  completed_at: string | null
  certificate_issued: boolean
  certificate_url: string | null
  payment_status: "pending" | "completed" | "failed" | "refunded"
  certification: {
    id: string
    title: string
    description: string
    duration: string
    level: string
  }
}

export interface ApplicationWithCertification {
  id: string
  certification_id: string
  full_name: string
  email: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  certification: {
    id: string
    title: string
    level: string
  }
}
