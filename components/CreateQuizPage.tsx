
import React, { useState } from 'react';
import { Quiz, NewQuizQuestion } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { useToast } from '../contexts/ToastContext';

interface CreateQuizPageProps {
  onCreateQuiz: (quizData: Omit<Quiz, 'id' | 'questions'> & { questions: NewQuizQuestion[] }) => void;
  onCancel: () => void;
}

const CreateQuizPage: React.FC<CreateQuizPageProps> = ({ onCreateQuiz, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<NewQuizQuestion[]>([
    { text: '', options: [{ text: '' }, { text: '' }], correctOptionId: 1 }
  ]);
  const { addToast } = useToast();

  const handleQuestionChange = (qIndex: number, field: 'text' | 'imageUrl', value: string) => {
    const newQuestions = questions.map((q, i) => {
      if (i === qIndex) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = questions.map((question, cqIndex) => {
      if (qIndex === cqIndex) {
        const newOptions = question.options.map((option, coIndex) => {
          if (oIndex === coIndex) {
            return { ...option, text: value };
          }
          return option;
        });
        return { ...question, options: newOptions };
      }
      return question;
    });
    setQuestions(newQuestions);
  };
  
  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOptionId = oIndex + 1;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    if (questions[qIndex].options.length >= 5) return;
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: '' });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) return;
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    
    // Adjust correctOptionId if the removed option was the correct one or before it
    if (newQuestions[qIndex].correctOptionId === oIndex + 1) {
        newQuestions[qIndex].correctOptionId = 1; // Default to first
    } else if (newQuestions[qIndex].correctOptionId > oIndex + 1) {
        newQuestions[qIndex].correctOptionId -= 1;
    }

    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions([...questions, { text: '', options: [{ text: '' }, { text: '' }], correctOptionId: 1 }]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, index) => index !== qIndex));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(title.trim() === '') {
        addToast('퀴즈 제목을 입력해주세요.', 'error');
        return;
    }

    const validQuestions = questions.filter(q => 
        q.text.trim() !== '' &&
        q.options.length >= 2 &&
        q.options.every(o => o.text.trim() !== '') &&
        q.correctOptionId > 0 && q.correctOptionId <= q.options.length
    );
    
    if(validQuestions.length < 1) {
        addToast('하나 이상의 완전한 질문을 입력해주세요. (질문, 2개 이상의 선택지, 정답 선택 포함)', 'error');
        return;
    }
    
    onCreateQuiz({ title: title.trim(), description: description.trim(), imageUrl, questions: validQuestions });
  };

  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">새로운 퀴즈 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">퀴즈 제목</label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 축구 상식 퀴즈" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
          <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="퀴즈에 대한 간단한 설명을 입력하세요." />
        </div>
        
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">퀴즈 대표 이미지 URL (선택)</label>
          <Input
            id="imageUrl"
            value={imageUrl || ''}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="퀴즈를 나타내는 이미지 링크를 입력하세요."
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">질문 설정</h3>
        <div className="space-y-6">
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-gray-50/50 space-y-4 relative group">
                    {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 font-bold w-7 h-7 rounded-full flex items-center justify-center bg-white border border-transparent hover:border-red-300 transition-all text-xl">&times;</button>
                    )}
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-500 mr-3">{qIndex + 1}</span>
                        <Input placeholder="질문을 입력하세요" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} required/>
                    </div>
                    <div className="pl-8 space-y-3">
                        <Input 
                            placeholder="질문 이미지 URL (선택)" 
                            value={q.imageUrl || ''} 
                            onChange={e => handleQuestionChange(qIndex, 'imageUrl', e.target.value)}
                            className="text-sm"
                        />
                        <p className="text-sm text-gray-600">선택지를 입력하고 정답을 선택하세요.</p>
                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                                <input type="radio" name={`correct-opt-${qIndex}`} checked={q.correctOptionId === oIndex + 1} onChange={() => handleCorrectOptionChange(qIndex, oIndex)} className="w-5 h-5 accent-[#0a54ff]"/>
                                <Input placeholder={`선택지 ${oIndex + 1}`} value={opt.text} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                                {q.options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-400 hover:text-red-500 font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">&times;</button>
                                )}
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                            <PlusIcon className="w-3 h-3 mr-1" />
                            선택지 추가
                        </Button>
                    </div>
                </div>
            ))}
             <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" />
                질문 추가
            </Button>
        </div>


        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
          <Button type="submit">퀴즈 생성하기</Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateQuizPage;
