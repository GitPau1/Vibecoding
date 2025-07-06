

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XIcon } from './icons/XIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface QuizPageProps {
  quizzes: Quiz[];
}

const QuizPage: React.FC<QuizPageProps> = ({ quizzes }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quiz = quizzes.find(q => q.id === id);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (quiz) {
      setUserAnswers(Array(quiz.questions.length).fill(null));
    } else if (quizzes.length > 0) { // Quizzes loaded but this one not found
      navigate('/', { replace: true });
    }
  }, [quiz, quizzes, navigate]);

  if (!quiz) {
    return null; // 또는 로딩 표시기
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionId;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };
  
  const score = userAnswers.reduce((acc, answer, index) => {
      const question = quiz.questions[index];
      // correctOptionId is 1-based index, so we get the option object
      const correctOption = question.options[question.correctOptionId - 1];
      // compare the selected answer's ID with the correct option's ID
      return answer === correctOption?.id ? acc + 1 : acc;
  }, 0);

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">퀴즈 결과</h2>
            <p className="mt-2 text-lg text-gray-600">"{quiz.title}"</p>
          </div>
          <div className="text-center bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-8">
            <p className="text-lg font-semibold text-indigo-800">최종 점수</p>
            <p className="text-5xl font-bold text-[#6366f1] my-2">{score} / {totalQuestions}</p>
            {score === totalQuestions && (
              <div className="flex items-center justify-center mt-3 text-amber-500 font-bold">
                <TrophyIcon className="w-6 h-6 mr-2"/>
                <span>만점입니다! 축하합니다!</span>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <h3 className="font-bold text-xl">결과 상세보기</h3>
            {quiz.questions.map((q, index) => {
              const userAnswerId = userAnswers[index];
              const correctOption = q.options[q.correctOptionId - 1];
              const isCorrect = userAnswerId === correctOption?.id;
              return (
                <div key={q.id} className="p-4 rounded-xl bg-gray-50 border">
                  <p className="font-semibold text-gray-800 mb-3">{index + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map(option => {
                      const isUserAnswer = option.id === userAnswerId;
                      const isCorrectAnswer = option.id === correctOption?.id;
                      
                      let bgClass = "bg-white";
                      if (isUserAnswer && !isCorrect) bgClass = "bg-red-100 border-red-300";
                      if (isCorrectAnswer) bgClass = "bg-green-100 border-green-300";

                      return (
                          <div key={option.id} className={`flex items-center p-3 rounded-lg border text-sm ${bgClass}`}>
                              <span className="flex-grow">{option.text}</span>
                              {isCorrectAnswer && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                              {isUserAnswer && !isCorrect && <XIcon className="w-5 h-5 text-red-600" />}
                          </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <ImageWithFallback src={currentQuestion.imageUrl} alt={`Question ${currentQuestionIndex + 1}`} className="w-full h-56 md:h-64 object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-semibold text-[#6366f1]">문제 {currentQuestionIndex + 1}/{totalQuestions}</span>
              <span className="text-gray-500">{quiz.title}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentQuestion.text}</h2>
        </div>

        <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-100">
          <div className="space-y-4">
            {currentQuestion.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-base
                  ${userAnswers[currentQuestionIndex] === option.id 
                    ? 'bg-[#6366f1] text-white border-[#4f46e5] shadow-lg' 
                    : 'bg-white hover:bg-indigo-50 border-gray-200'}`}
              >
                {option.text}
              </button>
            ))}
          </div>
          <div className="mt-8 text-right">
            <Button 
              onClick={handleNext} 
              disabled={userAnswers[currentQuestionIndex] === null}
            >
              {currentQuestionIndex < totalQuestions - 1 ? '다음 문제' : '결과 보기'} →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizPage;
