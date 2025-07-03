import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  const root = document.getElementById('root');
  if (root) {
      root.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #fff5f5; color: #c53030; display: flex; align-items: center; justify-content: center; padding: 1rem; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; background-color: white; padding: 2.5rem; border-radius: 0.75rem; border: 1px solid #fed7d7; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; color: #9b2c2c; margin: 0 0 1rem;">애플리케이션 설정 오류</h1>
            <p style="margin: 0 0 1rem; color: #2d3748;">Supabase 데이터베이스에 연결하려면 URL과 인증 키가 필요합니다.</p>
            <p style="margin: 0 0 1rem; color: #2d3748;">프로젝트 루트에 있는 <strong><code>config.ts</code></strong> 파일을 열고, 아래의 플레이스홀더 값을 실제 프로젝트의 정보로 교체해주세요.</p>
            <pre style="background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.375rem; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; color: #4a5568;">
export const SUPABASE_URL = 'YOUR_SUPABASE_URL';

export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';</pre>
            <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #718096;">이 정보는 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style="color: #3182ce; text-decoration: underline;">Supabase 대시보드</a>의 'Project Settings' &gt; 'API' 탭에서 찾을 수 있습니다.</p>
          </div>
        </div>
      `;
  }
  throw new Error('Supabase URL and Anon Key must be provided in config.ts. Application execution stopped.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
