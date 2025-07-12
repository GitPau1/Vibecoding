
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerRating, PlayerRatingSubmission } from '../types';
import { Card } from './ui/Card';
import PlayerRatingPage from './PlayerRatingPage';
import PlayerRatingResults from './PlayerRatingResults';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

interface PlayerRatingDetailPageProps {
  playerRatings: PlayerRating[];
  onRatePlayers: (ratingId: string, submissions: Omit<PlayerRatingSubmission, 'userId' | 'ratingId'>[]) => void;
  onRequestLogin: () => void;
}

const PlayerRatingDetailPage: React.FC<PlayerRatingDetailPageProps> = ({ playerRatings, onRatePlayers, onRequestLogin }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [viewingResults, setViewingResults] = useState(false);

  const rating = playerRatings.find(r => r.id === id);

  useEffect(() => {
    if (!rating && playerRatings.length > 0) {
      navigate('/', { replace: true });
    }
  }, [rating, playerRatings, navigate]);
  
  if (!rating) {
    return null;
  }

  const isExpired = new Date(rating.endDate) < new Date();
  
  const hasSubmitted = !!rating.userSubmission && rating.userSubmission.length > 0;
  const showResultsView = viewingResults || (session && (hasSubmitted || isExpired));

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <ImageWithFallback src={rating.imageUrl} alt={rating.title} className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-t-2xl" />
        <div className="p-6 md:p-8">
          <span className="text-sm font-semibold text-[#6366f1]">선수 평점</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{rating.title}</h2>
          {rating.description && <p className="mt-3 text-gray-600">{rating.description}</p>}
          <div className="mt-2 text-sm text-gray-500">
            {isExpired ? `평점이 ${new Date(rating.endDate).toLocaleString()}에 종료되었습니다.` : `마감: ${new Date(rating.endDate).toLocaleString()}`}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-100">
           {showResultsView ? (
                <PlayerRatingResults rating={rating} isExpired={isExpired} />
           ) : (
                <PlayerRatingPage 
                    rating={rating}
                    onRate={onRatePlayers}
                    isGuest={!session}
                    onRequestLogin={onRequestLogin}
                    onShowResults={() => setViewingResults(true)}
                />
           )}
        </div>
      </Card>
    </div>
  );
};

export default PlayerRatingDetailPage;
