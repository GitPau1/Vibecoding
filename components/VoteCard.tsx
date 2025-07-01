
import React from 'react';
import { Vote, VoteKind } from '../types';
import { Card } from './ui/Card';

interface VoteCardProps {
  vote: Vote;
  onSelectVote: (voteId: string) => void;
}

const VoteCard: React.FC<VoteCardProps> = ({ vote, onSelectVote }) => {
  const endDate = new Date(vote.endDate);
  const now = new Date();
  const isExpired = endDate < now;
  
  const diffTime = Math.abs(endDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalVotes = vote.type === VoteKind.RATING
    ? (vote.options[0]?.ratingCount || 0)
    : vote.options.reduce((sum, option) => sum + option.votes, 0);

  const hasParticipated = vote.userVote !== undefined || vote.userRatings !== undefined;
  
  const getCtaText = () => {
    if (hasParticipated) {
      return vote.type === VoteKind.RATING ? '내 평점 보기' : '결과 보기';
    }
    return vote.type === VoteKind.RATING ? '평점 매기기 →' : '투표 하기 →';
  };


  return (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
        onClick={() => onSelectVote(vote.id)}
    >
        {vote.imageUrl && (
            <img src={vote.imageUrl} alt={vote.title} className="w-full h-40 object-cover" />
        )}
        <div className="p-6 flex-grow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{vote.type}</span>
                {isExpired && vote.type !== VoteKind.RATING ? (
                    <span className="text-xs font-bold text-gray-500">투표 종료</span>
                ) : vote.type === VoteKind.RATING ? (
                    <span className="text-xs font-bold text-green-600">평점 진행중</span>
                ) : (
                    <span className="text-xs font-bold text-[#0a54ff]">{diffDays}일 남음</span>
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{vote.title}</h3>
            {vote.description && <p className="text-sm text-gray-500 line-clamp-2">{vote.description}</p>}
        </div>
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">총 {totalVotes.toLocaleString()}명 참여</span>
                <span className="font-semibold text-[#0a54ff] hover:underline">
                    {getCtaText()}
                </span>
            </div>
        </div>
    </Card>
  );
};

export default VoteCard;
