
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { EyeIcon } from './icons/EyeIcon';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from './icons/UserIcon';

interface ArticlePageProps {
  articles: Article[];
  onRecommend: (articleId: string) => void;
  onView: (articleId: string) => void;
  onDelete: (articleId: string) => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ articles, onRecommend, onView, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const article = articles.find(a => a.id === id);

  useEffect(() => {
    if (!article && articles.length > 0) {
      navigate('/', { replace: true });
    }
  }, [article, articles, navigate]);
  
  useEffect(() => {
    if (article) {
      onView(article.id);
    }
  }, [article, onView]);


  if (!article) {
    return null; // Or a loading indicator
  }

  const handleRecommend = () => {
    if (!article.userRecommended) {
      onRecommend(article.id);
    }
  };

  const isAuthor = session?.user.id === article.author?.id;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <ImageWithFallback src={article.imageUrl} alt={article.title} className="w-full h-56 md:h-72 object-cover rounded-t-2xl" />
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{article.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1.5"/>
              <span>{article.author?.nickname || '익명'}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5"/>
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <ThumbsUpIcon className="w-4 h-4 mr-1.5"/>
              <span>추천 {article.recommendations.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1.5"/>
              <span>조회 {article.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="article-body prose max-w-none p-6 md:p-8 border-t border-gray-100 text-gray-800" dangerouslySetInnerHTML={{ __html: article.body }} />
        
        <div className="bg-gray-50 px-6 py-6 md:px-8 border-t border-gray-200 flex justify-center items-center gap-4">
          {isAuthor ? (
            <>
              <Button onClick={() => navigate(`/edit/article/${article.id}`)} variant="outline" size="lg" className="min-w-[140px]">수정하기</Button>
              <Button onClick={() => onDelete(article.id)} variant="primary" size="lg" className="min-w-[140px] bg-red-600 hover:bg-red-700 focus:ring-red-500">삭제하기</Button>
            </>
          ) : (
            <Button 
              onClick={handleRecommend} 
              disabled={article.userRecommended} 
              size="lg"
              className="min-w-[180px]"
            >
              <ThumbsUpIcon className="w-5 h-5 mr-2" />
              {article.userRecommended ? '추천 완료' : '추천하기'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ArticlePage;