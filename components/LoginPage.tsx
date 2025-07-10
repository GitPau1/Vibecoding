
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, authLoading } = useAuth();
  const { addToast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/', { replace: true });
    }
  }, [session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn({ username, password });
    if (error) {
      if (error.message === 'Invalid login credentials') {
        addToast('아이디 또는 비밀번호가 올바르지 않습니다.', 'error');
      } else {
        addToast(error.message, 'error');
      }
    } else {
      addToast('로그인 되었습니다.', 'success');
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  if (authLoading || session) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-1 text-center">로그인</h2>
        <p className="text-gray-500 mb-6 text-center">SoccerVote에 오신 것을 환영합니다.</p>
        <form onSubmit={handleLogin} noValidate className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-[#6366f1] hover:text-[#4f46e5]">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;