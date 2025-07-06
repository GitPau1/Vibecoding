
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { Card } from './ui/Card';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();

  const handleSelectQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
        onClick={handleSelectQuiz}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectQuiz()}
    >
        <ImageWithFallback src={quiz.imageUrl} alt={quiz.title} className="w-full h-40 object-cover" />
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">퀴즈</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
            {quiz.description && <p className="text-sm text-gray-500 line-clamp-2">{quiz.description}</p>}
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">총 {quiz.questions.length}문항</span>
                <span className="font-semibold text-[#6366f1] hover:underline">
                    퀴즈 풀기 →
                </span>
            </div>
        </div>
    </Card>
  );
};

export default QuizCard;
