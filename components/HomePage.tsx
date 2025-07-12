
import React, { useState, useMemo } from 'react';
import { Vote, Article, XPost, VoteKind, PlayerRating } from '../types';
import VoteCard from './VoteCard';
import ArticleCard from './ArticleCard';
import XPostCard from './XPostCard';
import Carousel from './Carousel';
import PlayerRatingCard from './PlayerRatingCard';

interface HomePageProps {
  votes: Vote[];
  playerRatings: PlayerRating[];
  articles: Article[];
  xPosts: XPost[];
}

type CarouselItem = {
  id: string;
  title: string;
  imageUrl?: string;
  path: string;
  createdAt: string;
  category: string;
}

const HomePage: React.FC<HomePageProps> = ({ votes, playerRatings, articles, xPosts }) => {
  const [activeTab, setActiveTab] = useState<'match' | 'vote' | 'articles' | 'x-posts'>('match');

  const matchItems = useMemo(() => {
    const combined = [
        ...votes.filter(v => v.type === VoteKind.MATCH), 
        ...playerRatings
    ];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [votes, playerRatings]);

  const voteItems = useMemo(() => {
    return votes.filter(v => v.type === VoteKind.PLAYER || v.type === VoteKind.TOPIC)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [votes]);
  

  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedXPosts = [...xPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentItems: CarouselItem[] = useMemo(() => {
    const allContent = [
        ...votes.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/vote/${item.id}`, category: item.type })),
        ...playerRatings.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/rating/${item.id}`, category: '선수 평점' })),
        ...articles.map(item => ({ id: item.id, title: item.title, imageUrl: item.imageUrl, createdAt: item.createdAt, path: `/article/${item.id}`, category: '아티클' })),
        ...xPosts.map(item => ({ id: item.id, title: item.description, imageUrl: undefined, createdAt: item.createdAt, path: `/x-post/${item.id}`, category: '최신 소식' })),
    ];
    return allContent
        .filter(item => item.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
  }, [votes, playerRatings, articles, xPosts]);


  const getTabClassName = (tabName: typeof activeTab) => {
    return `w-full text-center px-4 py-2.5 rounded-full transition-all duration-300 font-medium text-base ${
              activeTab === tabName
                ? 'bg-white text-[#6366f1] shadow'
                : 'text-gray-500 hover:text-gray-800'
            }`;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {recentItems.length > 0 && <Carousel items={recentItems} />}
      
      <div className="p-1.5 bg-gray-100 rounded-full w-full max-w-2xl mx-auto">
        <nav className="flex items-center space-x-1" aria-label="Tabs">
          <button onClick={() => setActiveTab('match')} className={getTabClassName('match')}>매치</button>
          <button onClick={() => setActiveTab('vote')} className={getTabClassName('vote')}>투표</button>
          <button onClick={() => setActiveTab('articles')} className={getTabClassName('articles')}>아티클</button>
          <button onClick={() => setActiveTab('x-posts')} className={getTabClassName('x-posts')}>최신 소식</button>
        </nav>
      </div>

      <div className="mt-8">
         <>
            {activeTab === 'match' && (
              <section>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">매치 콘텐츠</h3>
                {matchItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {matchItems.map(item => 'type' in item ? <VoteCard key={item.id} vote={item} /> : <PlayerRatingCard key={item.id} rating={item} />)}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
                    <p className="text-gray-500">아직 매치 관련 콘텐츠가 없습니다.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'vote' && (
              <section>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">커뮤니티 투표</h3>
                {voteItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-6">
                    {voteItems.map(item => <VoteCard key={item.id} vote={item} />)}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-gray-100 rounded-2xl">
                    <p className="text-gray-500">진행중인 커뮤니티 투표가 없습니다.</p>
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
                  </div>
                )}
              </section>
            )}
         </>
      </div>
    </div>
  );
};

export default HomePage;
