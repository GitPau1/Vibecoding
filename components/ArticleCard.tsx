
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { Card } from './ui/Card';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { EyeIcon } from './icons/EyeIcon';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();

  const handleSelectArticle = () => {
    navigate(`/article/${article.id}`);
  };
  
  const plainTextBody = article.body.replace(/<[^>]*>?/gm, '');

  return (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
        onClick={handleSelectArticle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectArticle()}
    >
        <ImageWithFallback src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">아티클</span>
                <span className="text-xs text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{plainTextBody}</p>
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center">
                        <ThumbsUpIcon className="w-4 h-4 mr-1.5" />
                        <span>추천 {article.recommendations.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1.5" />
                        <span>조회 {article.views.toLocaleString()}</span>
                    </div>
                </div>
                <span className="font-semibold text-[#6366f1] hover:underline">
                    자세히 보기 →
                </span>
            </div>
        </div>
    </Card>
  );
};

export default ArticleCard;