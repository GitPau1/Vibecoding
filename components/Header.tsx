import React from 'react';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';

interface HeaderProps {
  onGoHome: () => void;
  onCreate: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onCreate }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto max-w-4xl p-4 flex justify-between items-center">
        <h1 
          className="text-2xl font-bold tracking-tighter cursor-pointer"
          onClick={onGoHome}
        >
          Soccer<span className="text-[#0a54ff]">Vote</span>
        </h1>
        <Button onClick={onCreate}>
          <PlusIcon className="w-4 h-4 mr-2" />
          콘텐츠 생성
        </Button>
      </div>
    </header>
  );
};

export default Header;
