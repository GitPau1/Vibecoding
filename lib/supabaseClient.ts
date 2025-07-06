
import { createClient } from '@supabase/supabase-js';
import { Player } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
      }
      quiz_question_options: {
        Row: {
          created_at: string
          id: string
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          text?: string
        }
      }
      quiz_questions: {
        Row: {
          correct_option_id_temp: number
          created_at: string
          id: string
          image_url: string | null
          quiz_id: string
          text: string
        }
        Insert: {
          correct_option_id_temp: number
          created_at?: string
          id?: string
          image_url?: string | null
          quiz_id: string
          text: string
        }
        Update: {
          correct_option_id_temp?: number
          created_at?: string
          id?: string
          image_url?: string | null
          quiz_id?: string
          text?: string
        }
      }
      vote_options: {
        Row: {
          comments: Json | null
          created_at: string
          id: string
          label: string
          rating_count: number | null
          vote_id: string
          votes: number
        }
        Insert: {
          comments?: Json | null
          created_at?: string
          id?: string
          label: string
          rating_count?: number | null
          vote_id: string
          votes?: number
        }
        Update: {
          comments?: Json | null
          created_at?: string
          id?: string
          label?: string
          rating_count?: number | null
          vote_id?: string
          votes?: number
        }
      }
      votes: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          players: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          players?: Json | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          players?: Json | null
          title?: string
          type?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_vote: {
        Args: {
          option_id_to_inc: string
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

// This application is a standard React setup, not a Next.js application.
// In client-side React apps (like those created with Create React App),
// environment variables must be prefixed with `REACT_APP_` to be exposed to the browser.
// The `NEXT_PUBLIC_` prefix is specific to Next.js and will not work here.
//
// Please ensure you have a `.env` file in your project's root directory with the following:
// REACT_APP_SUPABASE_URL=your-supabase-url
// REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// We initialize the client, but it will be null if the environment variables are missing.
// The main App component will handle this case and display a message to the user.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("Supabase configuration is missing. The app will display an error message. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment.");
}

/*
-- REQUIRED SUPABASE SQL SETUP --
-- Run these queries in your Supabase project's SQL Editor.

-- 1. Create Tables:
-- Note: Enable RLS (Row Level Security) for all tables and define policies.
-- For this public voting app, we allow public read access. For writes, you could
-- require users to be authenticated, or leave it open if it's a low-risk app.

-- VOTES & RATINGS TABLE
CREATE TABLE votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL, -- Enum: '경기 결과 예측', '베스트 플레이어', '찬반 투표', '선수 평점'
  image_url text,
  end_date text NOT NULL,
  players jsonb -- Used for PLAYER and RATING types to store player info
);
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on votes" ON votes FOR INSERT WITH CHECK (true); -- Example: allow anyone to create a vote. Change as needed.


-- VOTE OPTIONS TABLE
CREATE TABLE vote_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  votes integer DEFAULT 0 NOT NULL,
  rating_count integer DEFAULT 0, -- For RATING type
  comments jsonb DEFAULT '[]'::jsonb -- For RATING type
);
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on vote_options" ON vote_options FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on vote_options" ON vote_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on vote_options" ON vote_options FOR UPDATE USING (true) WITH CHECK (true);


-- QUIZZES TABLE
CREATE TABLE quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  image_url text
);
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quizzes" ON quizzes FOR SELECT USING (true);


-- QUIZ QUESTIONS TABLE
CREATE TABLE quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  image_url text,
  correct_option_id_temp integer NOT NULL -- Temporary column for simplicity, matching app logic.
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quiz_questions" ON quiz_questions FOR SELECT USING (true);


-- QUIZ QUESTION OPTIONS TABLE
CREATE TABLE quiz_question_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL
);
ALTER TABLE quiz_question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quiz_question_options" ON quiz_question_options FOR SELECT USING (true);


-- 2. Create RPC function to increment votes atomically
-- This prevents race conditions where two users vote at the same time.
CREATE OR REPLACE FUNCTION increment_vote(option_id_to_inc uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vote_options
  SET votes = votes + 1
  WHERE id = option_id_to_inc;
END;
$$;

*/
