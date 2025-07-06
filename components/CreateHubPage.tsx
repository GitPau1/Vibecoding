

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';

const CreateHubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">어떤 콘텐츠를 만드시겠어요?</h2>
        <p className="text-gray-500 mt-2">다른 축구 팬들과 함께 즐길 콘텐츠를 만들어보세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="p-8 text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
          onClick={() => navigate('/create/vote')}
        >
          <div className="text-5xl mb-4">🗳️</div>
          <h3 className="text-xl font-bold text-gray-900">투표 만들기</h3>
          <p className="text-gray-600 mt-2 text-sm">경기 결과, 찬반 등 다양한 주제로 투표를 시작하세요.</p>
        </Card>
        <Card 
          className="p-8 text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
          onClick={() => navigate('/create/rating')}
        >
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="text-xl font-bold text-gray-900">선수 평점 만들기</h3>
          <p className="text-gray-600 mt-2 text-sm">경기별 선수들의 활약을 평가하고 공유해보세요.</p>
        </Card>
        <Card 
          className="p-8 text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
          onClick={() => navigate('/create/quiz')}
        >
          <div className="text-5xl mb-4">❓</div>
          <h3 className="text-xl font-bold text-gray-900">퀴즈 만들기</h3>
          <p className="text-gray-600 mt-2 text-sm">재미있는 축구 퀴즈를 만들어 지식을 시험해보세요.</p>
        </Card>
        <Card 
          className="p-8 text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
          onClick={() => navigate('/create/article')}
        >
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900">아티클 작성</h3>
          <p className="text-gray-600 mt-2 text-sm">흥미로운 축구 소식이나 분석글을 공유해보세요.</p>
        </Card>
      </div>
    </div>
  );
};

export default CreateHubPage;