import type { Player, QuizQuestion, VoteOption } from "./types";

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
          options: VoteOption[]
          endDate: string
          players: Player[] | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          type: string
          description?: string | null
          imageUrl?: string | null
          options: VoteOption[]
          endDate: string
          players?: Player[] | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          type?: string
          description?: string | null
          imageUrl?: string | null
          options?: VoteOption[]
          endDate?: string
          players?: Player[] | null
        }
      }
      quizzes: {
        Row: {
            id: number
            created_at: string
            title: string
            description: string | null
            imageUrl: string | null
            questions: QuizQuestion[]
        }
        Insert: {
            id?: number
            created_at?: string
            title: string
            description?: string | null
            imageUrl?: string | null
            questions: QuizQuestion[]
        }
        Update: {
            id?: number
            created_at?: string
            title?: string
            description?: string | null
            imageUrl?: string | null
            questions?: QuizQuestion[]
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
