import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';

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
        <Button onClick={() => navigate('/create')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          콘텐츠 생성
        </Button>
      </div>
    </header>
  );
};

export default Header;