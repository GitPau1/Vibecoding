// ==================================================================
//  Supabase Configuration
// ==================================================================
// 이 파일에 실제 Supabase 프로젝트의 URL과 anon 키를 입력하세요.
// Supabase 대시보드의 'Project Settings' > 'API'에서 찾을 수 있습니다.
//
// IMPORTANT: Replace the placeholder values below with your actual
// Supabase credentials to connect the app to your database.
// ==================================================================

// NOTE: These are example values. They will allow the app to run,
// but data fetching will fail. Replace with your real Supabase credentials.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);