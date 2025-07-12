

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
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={handleSelectArticle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectArticle()}
    >
        <ImageWithFallback src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover rounded-t-2xl" />
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">아티클</span>
                <div className="flex items-center text-gray-600 space-x-3 text-xs">
                    <div className="flex items-center">
                        <ThumbsUpIcon className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{article.recommendations.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{article.views.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 h-7 line-clamp-1">{article.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 h-10">{plainTextBody}</p>
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{article.author?.nickname || '익명'}</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    </Card>
  );
};

export default ArticleCard;