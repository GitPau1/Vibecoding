
import React, { useState, useMemo } from 'react';
import { Vote, Quiz, Article, XPost } from '../types';
import VoteCard from './VoteCard';
import QuizCard from './QuizCard';
import ArticleCard from './ArticleCard';
import XPostCard from './XPostCard';
import Carousel from './Carousel';

interface HomePageProps {
  votes: Vote[];
  ratings: Vote[];
  quizzes: Quiz[];
  articles: Article[];
  xPosts: XPost[];
  loading: boolean;
}

type CarouselItem = {
  id: string;
  title: string;
  imageUrl?: string;
  path: string;
  createdAt: string;
}

const HomePage: React.FC<HomePageProps> = ({ votes, ratings, quizzes, articles, xPosts, loading }) => {
  const [activeTab, setActiveTab] = useState<'votes' | 'ratings' | 'quizzes' | 'articles' | 'x-posts'>('votes');

  const now = new Date();
  const ongoingVotes = votes.filter(vote => new Date(vote.endDate) >= now).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const finishedVotes = votes.filter(vote => new Date(vote.endDate) < now).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  const sortedRatings = [...ratings].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedXPosts = [...xPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentItems: CarouselItem[] = useMemo(() => {
    const allContent = [
        ...votes.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/vote/${item.id}` })),
        ...ratings.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/rating/${item.id}` })),
        ...quizzes.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/quiz/${item.id}` })),
        ...articles.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/article/${item.id}` })),
        ...xPosts.map(item => ({ id: item.id, title: item.description, imageUrl: undefined, createdAt: item.createdAt, path: item.postUrl }))
    ];
    return allContent
        .filter(item => item.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
  }, [votes, ratings, quizzes, articles, xPosts]);


  const getTabClassName = (tabName: typeof activeTab) => {
    return `w-full text-center px-4 py-2.5 rounded-full transition-all duration-300 font-medium text-base ${
              activeTab === tabName
                ? 'bg-white text-[#6366f1] shadow'
                : 'text-gray-500 hover:text-gray-800'
            }`;
  }
  
  const LoadingSkeleton = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-2xl -m-6 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="border-t mt-6 pt-3">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        ))}
      </div>
  );
  
  const CarouselSkeleton = () => (
    <div className="h-[300px] md:h-[400px] desktop:h-[450px] w-full bg-gray-200 animate-pulse rounded-3xl"></div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {loading ? (
        <CarouselSkeleton />
      ) : (
        recentItems.length > 0 && <Carousel items={recentItems} />
      )}
      
      <div className="p-1.5 bg-gray-100 rounded-full w-full max-w-3xl mx-auto">
        <nav className="flex items-center space-x-1" aria-label="Tabs">
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
          <button
            onClick={() => setActiveTab('articles')}
            className={getTabClassName('articles')}
          >
            아티클
          </button>
          <button
            onClick={() => setActiveTab('x-posts')}
            className={getTabClassName('x-posts')}
          >
            최신 소식
          </button>
        </nav>
      </div>

      <div className="mt-8">
       {loading ? <LoadingSkeleton /> : (
         <>
            {activeTab === 'votes' && (
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">진행중인 투표</h3>
                  {ongoingVotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                      {ongoingVotes.map(vote => (
                        <VoteCard key={vote.id} vote={vote} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
                      <p className="text-gray-500">현재 진행중인 투표가 없습니다.</p>
                      <p className="text-sm text-gray-400 mt-2">새로운 투표를 직접 만들어보세요!</p>
                    </div>
                  )}
                </section>

                {finishedVotes.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">마감된 투표</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                      {finishedVotes.map(vote => (
                        <VoteCard key={vote.id} vote={vote} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {sortedRatings.map(rating => (
                      <VoteCard key={rating.id} vote={rating} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                      <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
                    <p className="text-gray-500">현재 등록된 퀴즈가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-2">새로운 퀴즈를 직접 만들어보세요!</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'articles' && (
              <section>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">최신 아티클</h3>
                {sortedArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {sortedArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
                    <p className="text-gray-500">현재 등록된 아티클이 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-2">새로운 아티클을 직접 만들어보세요!</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'x-posts' && (
              <section>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">최신 소식</h3>
                {sortedXPosts.length > 0 ? (
                  <div className="max-w-2xl mx-auto space-y-6">
                    {sortedXPosts.map(post => (
                      <XPostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl max-w-2xl mx-auto">
                    <p className="text-gray-500">현재 등록된 소식이 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-2">새로운 소식을 직접 만들어보세요!</p>
                  </div>
                )}
              </section>
            )}
         </>
       )}
      </div>
    </div>
  );
};

export default HomePage;
