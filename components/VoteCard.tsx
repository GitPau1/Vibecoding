
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote } from '../types';
import { Card } from './ui/Card';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { UsersIcon } from './icons/UsersIcon';

interface VoteCardProps {
  vote: Vote;
}

const VoteCard: React.FC<VoteCardProps> = ({ vote }) => {
  const navigate = useNavigate();
  const endDate = new Date(vote.endDate);
  const now = new Date();
  const isExpired = endDate < now;
  
  const diffTime = Math.abs(endDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);
  
  const handleSelectVote = () => {
    navigate(`/vote/${vote.id}`);
  }

  return (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={handleSelectVote}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectVote()}
    >
        <ImageWithFallback src={vote.imageUrl} alt={vote.title} className="w-full h-40 object-cover rounded-t-2xl" />
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{vote.type}</span>
                <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>{totalVotes.toLocaleString()}명 참여</span>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 h-7 line-clamp-1">{vote.title}</h3>
            {vote.description ? (
              <p className="text-sm text-gray-500 line-clamp-2 h-10">{vote.description}</p>
            ) : (
              <div className="h-10" />
            )}
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
            <div className="flex justify-end items-center text-xs font-bold">
                 {isExpired ? (
                    <span className="text-gray-500">투표 종료</span>
                ) : (
                    <span className="text-[#6366f1]">{diffDays}일 남음</span>
                )}
            </div>
        </div>
    </Card>
  );
};

export default VoteCard;
