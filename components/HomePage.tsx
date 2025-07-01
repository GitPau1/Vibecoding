import React, { useState } from 'react';
import { Vote, Quiz } from '../types';
import VoteCard from './VoteCard';
import QuizCard from './QuizCard';

interface HomePageProps {
  votes: Vote[];
  ratings: Vote[];
  quizzes: Quiz[];
  onNavigate: (view: { page: 'vote' | 'quiz' | 'rating', id: string }) => void;
}

const HomePage: React.FC<HomePageProps> = ({ votes, ratings, quizzes, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'votes' | 'ratings' | 'quizzes'>('votes');

  const now = new Date();
  const ongoingVotes = votes.filter(vote => new Date(vote.endDate) >= now).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const finishedVotes = votes.filter(vote => new Date(vote.endDate) < now).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  const sortedRatings = ratings.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const getTabClassName = (tabName: typeof activeTab) => {
    return `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${
              activeTab === tabName
                ? 'border-[#0a54ff] text-[#0a54ff]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`;
  }

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900">오늘의 SoccerVote</h2>
        <p className="text-gray-500 mt-1">다양한 투표와 퀴즈에 참여해보세요!</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('votes')}
            className={getTabClassName('votes')}
          >
            투표
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={getTabClassName('ratings')}
          >
            선수 평점
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={getTabClassName('quizzes')}
          >
            퀴즈
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'votes' && (
          <div className="space-y-12">
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">진행중인 투표</h3>
              {ongoingVotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ongoingVotes.map(vote => (
                    <VoteCard key={vote.id} vote={vote} onSelectVote={(id) => onNavigate({ page: 'vote', id })} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">현재 진행중인 투표가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">새로운 투표를 직접 만들어보세요!</p>
                </div>
              )}
            </section>

            {finishedVotes.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">마감된 투표</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {finishedVotes.map(vote => (
                    <VoteCard key={vote.id} vote={vote} onSelectVote={(id) => onNavigate({ page: 'vote', id })} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        
        {activeTab === 'ratings' && (
          <section>
             <h3 className="text-2xl font-bold text-gray-900 mb-4">선수 평점</h3>
            {sortedRatings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedRatings.map(rating => (
                  <VoteCard key={rating.id} vote={rating} onSelectVote={(id) => onNavigate({ page: 'rating', id })} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-gray-100 rounded-lg">
                <p className="text-gray-500">현재 등록된 선수 평점이 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">새로운 선수 평점을 직접 만들어보세요!</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'quizzes' && (
          <section>
             <h3 className="text-2xl font-bold text-gray-900 mb-4">도전! 퀴즈</h3>
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} onSelectQuiz={(id) => onNavigate({ page: 'quiz', id })} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-gray-100 rounded-lg">
                <p className="text-gray-500">현재 등록된 퀴즈가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">새로운 퀴즈를 직접 만들어보세요!</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;