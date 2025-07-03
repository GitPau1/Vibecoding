import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Supabase URL과 anon 키는 환경 변수를 통해 설정해야 합니다.
// 로컬 개발 환경에서는 .env 파일과 같은 도구를 사용하여 이 변수들을 로드할 수 있습니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 사용자가 키를 설정하도록 UI에 메시지를 표시하는 것이 더 나은 방법일 수 있습니다.
  // 이 예제에서는 앱이 충돌하는 대신 콘솔에 오류를 기록합니다.
  console.error('Supabase URL and Anon Key must be provided in environment variables.');
}

// createClient 호출 시 URL과 키가 없으면 내부적으로 오류를 발생시킬 수 있으므로,
// 유효한 값으로만 초기화하거나, 값이 없을 경우 null 클라이언트를 다루는 로직이 필요합니다.
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
