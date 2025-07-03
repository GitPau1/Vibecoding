
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Vercel 환경 변수에서 Supabase 접속 정보를 읽어옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 설정되었는지 확인합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  const root = document.getElementById('root');
  if (root) {
      root.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #fff5f5; color: #c53030; display: flex; align-items: center; justify-content: center; padding: 1rem; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; z-index: 9999;">
          <div style="max-width: 800px; background-color: white; padding: 2.5rem; border-radius: 0.75rem; border: 1px solid #fed7d7; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; color: #9b2c2c; margin: 0 0 1rem;">애플리케이션 설정 오류</h1>
            <p style="margin: 0 0 1.5rem; color: #2d3748;">Vercel 배포 또는 로컬 개발을 위한 Supabase 환경 변수가 설정되지 않았습니다.</p>
            
            <div style="margin-bottom: 2rem;">
              <h2 style="font-size: 1.125rem; font-weight: 600; color: #2d3748; margin: 0 0 0.75rem;">Vercel에 배포하는 경우:</h2>
              <p style="margin: 0 0 0.5rem; color: #4a5568;">Vercel 프로젝트 대시보드의 <strong>Settings &gt; Environment Variables</strong>에서 다음 변수를 추가해주세요:</p>
              <ul style="list-style-type: disc; margin: 0 0 0 1.5rem; padding: 0; color: #4a5568;">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
            </div>

            <div>
              <h2 style="font-size: 1.125rem; font-weight: 600; color: #2d3748; margin: 0 0 0.75rem;">로컬에서 개발하는 경우:</h2>
              <p style="margin: 0 0 0.5rem; color: #4a5568;">프로젝트 루트에 <code>.env.local</code> 파일을 생성하고 아래 내용을 채워주세요:</p>
              <pre style="background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.375rem; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; color: #4a5568;">NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY</pre>
            </div>
            
            <p style="margin-top: 2rem; font-size: 0.875rem; color: #718096;">Supabase URL과 키는 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style="color: #3182ce; text-decoration: underline;">Supabase 대시보드</a>의 'Project Settings' &gt; 'API' 탭에서 찾을 수 있습니다.</p>
          </div>
        </div>
      `;
  }
  throw new Error('Supabase URL and Anon Key must be provided in environment variables. Application execution stopped.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
