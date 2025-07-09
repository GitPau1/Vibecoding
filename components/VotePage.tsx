

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, VoteKind, VoteOption } from '../types';
import { Card } from './ui/Card';
import MatchVote from './MatchVote';
import PlayerVote from './PlayerVote';
import TopicVote from './TopicVote';
import VoteResults from './VoteResults';
import PlayerRatingPage from './PlayerRatingPage';
import PlayerRatingResults from './PlayerRatingResults';
import { TrophyIcon } from './icons/TrophyIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface VotePageProps {
  votes?: Vote[];
  ratings?: Vote[];
  onVote: (voteId: string, optionId: string) => void;
  onRatePlayers: (voteId: string, ratings: { [playerId: number]: { rating: number; comment: string | null; }; }) => void;
}

const VotePage: React.FC<VotePageProps> = ({ votes, ratings, onVote, onRatePlayers }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const dataSet = votes || ratings;
  const vote = dataSet?.find(v => v.id === id);

  useEffect(() => {
    if (!vote && dataSet && dataSet.length > 0) {
      // 데이터가 로드되었지만 일치하는 투표가 없으면 홈으로 이동
      navigate('/', { replace: true });
    }
  }, [vote, dataSet, navigate]);

  if (!vote) {
    return null; // 또는 로딩 표시기
  }

  const hasVoted = vote.userVote !== undefined || vote.userRatings !== undefined;
  const isExpired = new Date(vote.endDate) < new Date();
  
  // RATING 유형의 경우 사용자가 평가한 후에만 결과를 표시. "만료됨" 상태가 일반적임.
  // 다른 유형의 경우 투표했거나 만료된 경우 결과를 표시.
  const showResults = vote.type === VoteKind.RATING ? hasVoted : (hasVoted || isExpired);

  const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);
  let winner: VoteOption | undefined = undefined;

  if (isExpired && totalVotes > 0 && vote.type !== VoteKind.RATING) {
    const maxVotes = Math.max(...vote.options.map(o => o.votes));
    const winners = vote.options.filter(o => o.votes === maxVotes);
    if (winners.length === 1) {
      winner = winners[0];
    }
  }

  const renderVoteComponent = () => {
    switch (vote.type) {
      case VoteKind.MATCH:
        return <MatchVote vote={vote} onVote={(optionId) => onVote(vote.id, optionId)} />;
      case VoteKind.PLAYER:
        return <PlayerVote vote={vote} onVote={(optionId) => onVote(vote.id, optionId)} />;
      case VoteKind.TOPIC:
        return <TopicVote vote={vote} onVote={(optionId) => onVote(vote.id, optionId)} />;
      case VoteKind.RATING:
        return <PlayerRatingPage vote={vote} onRate={onRatePlayers} />;
      default:
        return <p>Unknown vote type</p>;
    }
  };
  
  const renderResultsComponent = () => {
    if (vote.type === VoteKind.RATING) {
        return <PlayerRatingResults vote={vote} />;
    }
    return <VoteResults vote={vote} isExpired={isExpired} />;
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <ImageWithFallback src={vote.imageUrl} alt={vote.title} className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-t-2xl" />
        <div className="p-6 md:p-8">
          <span className="text-sm font-semibold text-[#6366f1]">{vote.type}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{vote.title}</h2>
          {vote.description && <p className="mt-3 text-gray-600">{vote.description}</p>}
          <div className="mt-2 text-sm text-gray-500">
            {isExpired ? `투표가 ${new Date(vote.endDate).toLocaleDateString()}에 종료되었습니다.` : `마감: ${new Date(vote.endDate).toLocaleDateString()}`}
          </div>
        </div>

        {winner && (
          <div className="border-t border-gray-200 bg-amber-50 p-6">
            <div className="text-center">
              <div className="flex justify-center items-center text-amber-600 mb-2">
                <TrophyIcon className="w-6 h-6 mr-2" />
                <p className="font-semibold text-base">투표 최종 1위</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{winner.label}</p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-100">
          {showResults ? renderResultsComponent() : renderVoteComponent()}
        </div>
      </Card>
    </div>
  );
};

export default VotePage;