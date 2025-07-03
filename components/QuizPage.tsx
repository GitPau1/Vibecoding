import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XIcon } from './icons/XIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { supabase } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    const fetchQuiz = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error("Error fetching quiz", error);
        addToast('퀴즈를 불러오지 못했습니다.', 'error');
        navigate('/', { replace: true });
      } else {
        setQuiz(data);
        setUserAnswers(Array(data.questions.length).fill(null));
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [id, navigate, addToast]);

  if (loading) {
    return <Card className="p-6 md:p-8 text-center"><p className="text-gray-500">퀴즈를 불러오는 중...</p></Card>;
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleAnswerSelect = (optionId: number) => {
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
      return answer === quiz.questions[index].correctOptionId ? acc + 1 : acc;
  }, 0);

  if (isFinished) {
    return (
      <Card className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">퀴즈 결과</h2>
          <p className="mt-2 text-lg text-gray-600">"{quiz.title}"</p>
        </div>
        <div className="text-center bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-lg font-semibold text-blue-800">최종 점수</p>
          <p className="text-5xl font-bold text-[#0a54ff] my-2">{score} / {totalQuestions}</p>
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
            const isCorrect = userAnswerId === q.correctOptionId;
            return (
              <div key={q.id} className="p-4 rounded-lg bg-gray-50 border">
                <p className="font-semibold text-gray-800 mb-3">{index + 1}. {q.text}</p>
                <div className="space-y-2">
                  {q.options.map(option => {
                    const isUserAnswer = option.id === userAnswerId;
                    const isCorrectAnswer = option.id === q.correctOptionId;
                    
                    let bgClass = "bg-white";
                    if (isUserAnswer && !isCorrect) bgClass = "bg-red-100 border-red-300";
                    if (isCorrectAnswer) bgClass = "bg-green-100 border-green-300";

                    return (
                        <div key={option.id} className={`flex items-center p-3 rounded-md border text-sm ${bgClass}`}>
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
    );
  }

  return (
    <Card className="overflow-hidden">
      {currentQuestion.imageUrl && (
        <img src={currentQuestion.imageUrl} alt={`Question ${currentQuestionIndex + 1}`} className="w-full h-56 md:h-64 object-cover" />
      )}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-semibold text-[#0a54ff]">문제 {currentQuestionIndex + 1}/{totalQuestions}</span>
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
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-base
                ${userAnswers[currentQuestionIndex] === option.id 
                  ? 'bg-[#0a54ff] text-white border-[#0a54ff] shadow-lg' 
                  : 'bg-white hover:bg-gray-100 border-gray-200'}`}
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
  );
};

export default QuizPage;