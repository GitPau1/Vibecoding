
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || !supabaseUrl || !supabaseAnonKey) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f9fafb;
        padding: 20px;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
      ">
        <div style="
          background-color: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 2rem;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        ">
          <h1 style="font-size: 1.5rem; font-weight: bold; color: #dc2626;">설정 오류</h1>
          <p style="margin-top: 1rem; color: #374151;">
            Supabase 설정이 완료되지 않았습니다.
          </p>
          <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
            애플리케이션을 실행하려면 <code>config.ts</code> 파일을 열고, <code>SUPABASE_URL</code> 및 <code>SUPABASE_ANON_KEY</code> 값을 당신의 Supabase 프로젝트 정보로 교체해야 합니다. 이 값들은 Supabase 프로젝트 대시보드의 'Settings' > 'API' 메뉴에서 찾을 수 있습니다.
          </p>
          <div style="
            margin-top: 1.5rem;
            background-color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.875rem;
            color: #4b5563;
            text-align: left;
          ">
            <p><strong>// In config.ts:</strong></p>
            <p style="margin-top: 0.5rem;">export const SUPABASE_URL = "https://your-project-ref.supabase.co";</p>
            <p style="margin-top: 0.5rem;">export const SUPABASE_ANON_KEY = "your-anon-key";</p>
          </div>
        </div>
      </div>
    `;
  }
  // 추가적인 스크립트 실행을 막기 위해 오류를 발생시킵니다.
  throw new Error("Supabase URL and Anon Key must be provided in config.ts. Application execution stopped.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
