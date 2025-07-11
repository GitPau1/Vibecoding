
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { XIcon } from './icons/XIcon';
import { LockIcon } from './icons/LockIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 text-center" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 z-10"><XIcon className="w-6 h-6"/></button>
        <div className="p-8 pt-10">
          <div className="w-16 h-16 rounded-full bg-indigo-100 mx-auto flex items-center justify-center mb-5">
            <LockIcon className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">로그인이 필요합니다</h3>
          <p className="text-gray-600 mt-2">
            이 기능을 사용하려면 로그인 또는 회원가입이 필요합니다.
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-b-2xl grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => handleNavigate('/login')} size="lg">로그인</Button>
          <Button onClick={() => handleNavigate('/signup')} size="lg">회원가입</Button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
