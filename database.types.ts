export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// It's better to use specific types for JSON columns to avoid type errors.
// These types are based on the application's types in `types.ts`.

export interface VoteOptionForDB {
  id: number;
  label: string;
  votes: number;
  ratingCount?: number;
  comments?: string[];
}

export interface PlayerForDB {
    id: number;
    name: string;
    team: string;
    photoUrl?: string;
    isStarter?: boolean;
}

export interface QuizQuestionOptionForDB {
  id: number;
  text: string;
}

export interface QuizQuestionForDB {
  id: number;
  text: string;
  options: QuizQuestionOptionForDB[];
  correctOptionId: number;
  imageUrl?: string;
}


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
