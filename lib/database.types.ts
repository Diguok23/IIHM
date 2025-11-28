export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          program_category: string
          program_name: string
          start_date: string
          study_mode: string
          highest_education: string
          previous_certifications: string | null
          years_experience: string
          current_employer: string | null
          current_position: string | null
          heard_about: string | null
          questions: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          program_category: string
          program_name: string
          start_date: string
          study_mode: string
          highest_education: string
          previous_certifications?: string | null
          years_experience: string
          current_employer?: string | null
          current_position?: string | null
          heard_about?: string | null
          questions?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          date_of_birth?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          program_category?: string
          program_name?: string
          start_date?: string
          study_mode?: string
          highest_education?: string
          previous_certifications?: string | null
          years_experience?: string
          current_employer?: string | null
          current_position?: string | null
          heard_about?: string | null
          questions?: string | null
          status?: string
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          application_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
        }
        Update: {
          id?: string
          created_at?: string
          application_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
        }
      }
      certifications: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          category: string
          level: string
          price: number
          slug: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          category: string
          level: string
          price: number
          slug: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          category?: string
          level?: string
          price?: number
          slug?: string
        }
      }
    }
  }
}
