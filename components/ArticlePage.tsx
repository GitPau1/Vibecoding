import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface ArticlePageProps {
  articles: Article[];
  onRecommend: (articleId: string) => void;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ articles, onRecommend }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const article = articles.find(a => a.id === id);

  useEffect(() => {
    if (!article && articles.length > 0) {
      navigate('/', { replace: true });
    }
  }, [article, articles, navigate]);

  if (!article) {
    return null; // Or a loading indicator
  }

  const handleRecommend = () => {
    if (!article.userRecommended) {
      onRecommend(article.id);
    }
  };

  return (
    <Card className="overflow-hidden">
       {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="w-full h-56 md:h-72 object-cover" />
      )}
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{article.title}</h2>
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1.5"/>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <ThumbsUpIcon className="w-4 h-4 mr-1.5"/>
            <span>추천 {article.recommendations.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="article-body prose max-w-none p-6 md:p-8 border-t border-gray-100 text-gray-800" dangerouslySetInnerHTML={{ __html: article.body }} />

      <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-200 text-center">
        <Button 
          onClick={handleRecommend} 
          disabled={article.userRecommended} 
          size="lg"
          className="min-w-[180px]"
        >
          <ThumbsUpIcon className="w-5 h-5 mr-2" />
          {article.userRecommended ? '추천 완료' : '추천하기'}
        </Button>
      </div>
    </Card>
  );
};

export default ArticlePage;