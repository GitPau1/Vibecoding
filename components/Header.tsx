import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-7xl p-4 flex justify-between items-center">
        <h1 
          className="text-2xl font-bold tracking-tighter cursor-pointer"
          onClick={() => navigate('/')}
        >
          Soccer<span className="text-[#6366f1]">Vote</span>
        </h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/squad')} size="md">
                <UsersIcon className="w-4 h-4 mr-2" />
                스쿼드 관리
            </Button>
            <Button onClick={() => navigate('/create')} size="md">
              <PlusIcon className="w-4 h-4 mr-2" />
              콘텐츠 생성
            </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;