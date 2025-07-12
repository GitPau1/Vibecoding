import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { session, profile, signOut, authLoading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-7xl px-4 py-3 md:p-4 flex justify-between items-center">
        <h1 
          className="text-xl md:text-2xl font-bold tracking-tighter cursor-pointer"
          onClick={() => navigate('/')}
        >
          Soccer<span className="text-[#6366f1]">Vote</span>
        </h1>
        <div className="flex items-center gap-2">
          {authLoading ? (
            <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          ) : session ? (
            <>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                환영합니다, {profile?.nickname || '사용자'}님!
              </span>
              <Button variant="outline" onClick={() => navigate('/squad')} size="md">
                  <UsersIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">스쿼드 관리</span>
              </Button>
              <Button onClick={() => navigate('/create')} size="md">
                <PlusIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">콘텐츠 생성</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} size="md">
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/login')} size="md">
                로그인
              </Button>
              <Button onClick={() => navigate('/signup')} size="md">
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
