

import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          created_at: string
          title: string
          body: string
          image_url: string | null
          recommendations: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          body: string
          image_url?: string | null
          recommendations?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          body?: string
          image_url?: string | null
          recommendations?: number
        }
      }
      bug_reports: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          url: string
          screenshot_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          url: string
          screenshot_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          url?: string
          screenshot_url?: string | null
        }
      }
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
          comments: any | null
          created_at: string
          id: string
          label: string
          rating_count: number | null
          vote_id: string
          votes: number
        }
        Insert: {
          comments?: any | null
          created_at?: string
          id?: string
          label: string
          rating_count?: number | null
          vote_id: string
          votes?: number
        }
        Update: {
          comments?: any | null
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
          players: any | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          players?: any | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          players?: any | null
          title?: string
          type?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_recommendation: {
        Args: {
          article_id_to_inc: string
        }
        Returns: undefined
      }
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

// This application uses Vite, a modern build tool for web development.
// For client-side applications built with Vite, environment variables must be
// prefixed with `VITE_` to be exposed to the browser for security reasons.
// This is different from Create React App which uses `REACT_APP_`.
//
// When deploying to Vercel, you must set these environment variables in your
// Vercel project's settings. Make sure they are also prefixed with `VITE_`.
//
// For local development, create a `.env` file in the project's root directory with:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

// Safely access environment variables to prevent crashes when `import.meta.env` is undefined.
// This can happen in environments that do not use Vite or a similar build tool.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;


// We initialize the client, but it will be null if the environment variables are missing.
// The main App component will handle this case and display a message to the user.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("Supabase configuration is missing. The app will display an error message. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
}

/*
-- REQUIRED SUPABASE SQL SETUP --
-- Run these queries in your Supabase project's SQL Editor.

-- 1. Create Tables:
-- Note: Enable RLS (Row Level Security) for all tables and define policies.
-- For this public voting app, we allow public read access. For writes, you could
-- require users to be authenticated, or leave it open if it's a low-risk app.

-- ARTICLES TABLE
CREATE TABLE articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  recommendations integer DEFAULT 0 NOT NULL
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on articles" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on articles" ON articles FOR UPDATE USING (true) WITH CHECK (true);


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


-- BUG REPORTS TABLE
CREATE TABLE bug_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  screenshot_url text
);
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert on bug_reports" ON bug_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on bug_reports" ON bug_reports FOR SELECT USING (true);


-- 2. Create RPC functions to increment votes/recommendations atomically
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

CREATE OR REPLACE FUNCTION increment_recommendation(article_id_to_inc uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.articles
  SET recommendations = recommendations + 1
  WHERE id = article_id_to_inc;
END;
$$;


-- 3. Create Storage Bucket for Bug Reports
-- Go to Storage -> Buckets -> Create Bucket
-- Name it 'bug_screenshots' and make it a Public bucket.
-- Define policies for upload access. For an anonymous app, you might allow all inserts:
-- (Go to Storage -> Policies -> bug_screenshots -> New Policy -> For INSERT)
-- CREATE POLICY "Allow anon uploads" ON storage.objects
-- FOR INSERT TO public
-- WITH CHECK (bucket_id = 'bug_screenshots');

*/
