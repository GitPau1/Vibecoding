export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      votes: {
        Row: {
          id: number
          created_at: string
          title: string
          type: string
          description: string | null
          imageUrl: string | null
          options: Json
          endDate: string
          players: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          type: string
          description?: string | null
          imageUrl?: string | null
          options: Json
          endDate: string
          players?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          type?: string
          description?: string | null
          imageUrl?: string | null
          options?: Json
          endDate?: string
          players?: Json | null
        }
      }
      quizzes: {
        Row: {
            id: number
            created_at: string
            title: string
            description: string | null
            imageUrl: string | null
            questions: Json
        }
        Insert: {
            id?: number
            created_at?: string
            title: string
            description?: string | null
            imageUrl?: string | null
            questions: Json
        }
        Update: {
            id?: number
            created_at?: string
            title?: string
            description?: string | null
            imageUrl?: string | null
            questions?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
        increment_vote_option: {
            Args: {
              vote_id_in: number
              option_id_in: number
            }
            Returns: undefined
        }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
