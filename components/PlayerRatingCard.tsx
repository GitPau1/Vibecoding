
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerRating } from '../types';
import { Card } from './ui/Card';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { UsersIcon } from './icons/UsersIcon';

interface PlayerRatingCardProps {
  rating: PlayerRating;
}

const PlayerRatingCard: React.FC<PlayerRatingCardProps> = ({ rating }) => {
  const navigate = useNavigate();
  const endDate = new Date(rating.endDate);
  const now = new Date();
  const isExpired = endDate < now;
  
  const totalRaters = rating.stats?.[0]?.ratingCount || 0;
  
  const handleSelect = () => {
    navigate(`/rating/${rating.id}`);
  }

  return (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect}
    >
        <ImageWithFallback src={rating.imageUrl} alt={rating.title} className="w-full h-40 object-cover rounded-t-2xl" />
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">선수 평점</span>
                <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>{totalRaters.toLocaleString()}명 참여</span>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 h-7 line-clamp-1">{rating.title}</h3>
            {rating.description ? (
              <p className="text-sm text-gray-500 line-clamp-2 h-10">{rating.description}</p>
            ) : (
              <div className="h-10" />
            )}
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-end items-center text-xs font-bold">
                 {isExpired ? (
                    <span className="text-gray-500">평점 종료</span>
                ) : (
                    <span className="text-green-600">평점 진행중</span>
                )}
            </div>
        </div>
    </Card>
  );
};

export default PlayerRatingCard;
