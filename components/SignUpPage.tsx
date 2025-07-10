

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, session, authLoading, checkUsernameAvailability } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(true);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/', { replace: true });
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (password && password.length < 6) {
      setIsPasswordLengthValid(false);
    } else {
      setIsPasswordLengthValid(true);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameStatus('invalid');
      setUsernameMessage('3~20자의 영문, 숫자, 밑줄(_)만 사용 가능합니다.');
      return;
    }
    
    setUsernameStatus('checking');
    setUsernameMessage('아이디 중복 확인 중...');

    debounceTimer.current = window.setTimeout(async () => {
        const { available, message } = await checkUsernameAvailability(trimmedUsername);
        setUsernameStatus(available ? 'available' : 'taken');
        setUsernameMessage(message);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [username, checkUsernameAvailability]);
  
  const isFormValid = usernameStatus === 'available' && passwordsMatch && isPasswordLengthValid && password !== '' && nickname.trim().length >= 2;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        addToast('입력 내용을 다시 확인해주세요.', 'error');
        return;
    }
    
    setLoading(true);

    const { session: newSession, error } = await signUp({ username, password, nickname });

    setLoading(false);

    if (error) {
      addToast(error.message, 'error');
      return;
    }

    if (newSession) {
      addToast('회원가입 및 로그인에 성공했습니다!', 'success');
      navigate('/');
    } else {
        // This case should ideally not happen with the new logic unless email confirmation is on.
        addToast('회원가입에 성공했으나, 로그인에 실패했습니다. 다시 로그인해주세요.', 'info');
        navigate('/login');
    }
  };
  
  const getUsernameMessageColor = () => {
    switch(usernameStatus) {
        case 'available': return 'text-green-600';
        case 'taken':
        case 'invalid': return 'text-red-600';
        default: return 'text-gray-500';
    }
  }

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
        <h2 className="text-2xl font-bold mb-1 text-center">회원가입</h2>
        <p className="text-gray-500 mb-6 text-center">몇 단계만 거치면 바로 시작할 수 있습니다.</p>
        <form onSubmit={handleSignUp} noValidate className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <Input 
              id="username" 
              name="username"
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              minLength={3} 
              maxLength={20}
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="3~20자의 영문, 숫자, 밑줄(_)만 사용 가능합니다."
              autoComplete="username" 
            />
            <p className={`text-xs mt-1 ${getUsernameMessageColor()}`}>
                {usernameStatus === 'idle' ? '3~20자의 영문, 숫자, 밑줄(_)만 사용 가능합니다.' : usernameMessage}
            </p>
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
            <Input id="nickname" name="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} required minLength={2} maxLength={20} autoComplete="nickname" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6} 
              autoComplete="new-password"
              className={!isPasswordLengthValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {!isPasswordLengthValid ? (
              <p className="text-xs text-red-600 mt-1">비밀번호는 6자 이상이어야 합니다.</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">6자 이상 입력해주세요.</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword"
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              minLength={6} 
              autoComplete="new-password"
              className={!passwordsMatch && confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {!passwordsMatch && confirmPassword && (
                <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>
          <Button type="submit" disabled={!isFormValid || loading} className="w-full !mt-6">
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-[#6366f1] hover:text-[#4f46e5]">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignUpPage;