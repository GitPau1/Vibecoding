
import React, { useEffect, useState, useCallback } from 'react';
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
import { supabase } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

const VotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);

  const isRatingPage = window.location.hash.includes('/rating/');

  const loadUserAction = useCallback(() => {
    if (!id) return null;
    try {
      const key = isRatingPage ? `rating-${id}` : `vote-${id}`;
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Failed to parse user action from localStorage", error);
      return null;
    }
  }, [id, isRatingPage]);

  useEffect(() => {
    if (!id) {
        navigate('/');
        return;
    }

    const fetchVote = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error("Error fetching vote:", error);
            addToast('투표를 불러오지 못했습니다.', 'error');
            navigate('/', { replace: true });
        } else {
            const userAction = loadUserAction();
            const voteData = data as unknown as Vote;
            const populatedData = { ...voteData, ...userAction };
            setVote(populatedData);
        }
        setLoading(false);
    };

    fetchVote();
  }, [id, navigate, addToast, loadUserAction]);

  const handleVote = useCallback(async (optionId: number) => {
    if (!vote) return;

    const { error } = await supabase.rpc('increment_vote_option', {
      vote_id_in: vote.id,
      option_id_in: optionId,
    });

    if (error) {
        addToast('투표 처리 중 오류가 발생했습니다.', 'error');
        console.error('Error incrementing vote:', error);
    } else {
        addToast('투표가 제출되었습니다!', 'success');
        const updatedVote = { ...vote };
        const optionIndex = updatedVote.options.findIndex(o => o.id === optionId);
        if (optionIndex > -1) {
            updatedVote.options[optionIndex].votes++;
        }
        updatedVote.userVote = optionId;
        setVote(updatedVote);
        
        localStorage.setItem(`vote-${vote.id}`, JSON.stringify({ userVote: optionId }));
    }
  }, [vote, addToast]);

  const handlePlayerRatingSubmit = useCallback(async (playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
    if (!vote) return;

    const { data: currentVoteData, error: fetchError } = await supabase
      .from('votes')
      .select('options')
      .eq('id', vote.id)
      .single();

    if(fetchError || !currentVoteData) {
      addToast('평점을 처리하는 중 오류가 발생했습니다.', 'error');
      return;
    }

    const newOptions = (currentVoteData.options as VoteOption[]).map(opt => ({...opt}));

    Object.entries(playerRatings).forEach(([playerIdStr, ratingData]) => {
      const playerId = parseInt(playerIdStr, 10);
      const optionIndex = newOptions.findIndex(o => o.id === playerId);
      if(optionIndex > -1) {
        const option = newOptions[optionIndex];
        option.votes = (option.votes || 0) + ratingData.rating;
        option.ratingCount = (option.ratingCount || 0) + 1;
        if(ratingData.comment && ratingData.comment.trim() !== "") {
          option.comments = [...(option.comments || []), ratingData.comment.trim()];
        }
      }
    });

    const { data: updatedVoteData, error: updateError } = await supabase
      .from('votes')
      .update({ options: newOptions })
      .eq('id', vote.id)
      .select()
      .single();

    if (updateError || !updatedVoteData) {
      addToast('평점 처리 중 오류가 발생했습니다.', 'error');
      console.error('Error submitting rating:', updateError);
    } else {
      addToast('평점이 제출되었습니다. 감사합니다!', 'success');
      const userAction = { userRatings: playerRatings };
      setVote({ ...(updatedVoteData as unknown as Vote), ...userAction });
      localStorage.setItem(`rating-${vote.id}`, JSON.stringify(userAction));
    }
  }, [vote, addToast]);

  if (loading) {
    return (
      <Card className="p-6 md:p-8 text-center">
        <p className="text-gray-500">투표 정보를 불러오는 중입니다...</p>
      </Card>
    );
  }

  if (!vote) {
    return null;
  }

  const hasVoted = vote.userVote !== undefined || vote.userRatings !== undefined;
  const isExpired = new Date(vote.endDate) < new Date();
  
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
        return <MatchVote vote={vote} onVote={handleVote} />;
      case VoteKind.PLAYER:
        return <PlayerVote vote={vote} onVote={handleVote} />;
      case VoteKind.TOPIC:
        return <TopicVote vote={vote} onVote={handleVote} />;
      case VoteKind.RATING:
        return <PlayerRatingPage vote={vote} onRate={handlePlayerRatingSubmit} />;
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
    <Card className="overflow-hidden">
       {vote.imageUrl && (
        <img src={vote.imageUrl} alt={vote.title} className="w-full h-56 md:h-64 object-cover" />
      )}
      <div className="p-6 md:p-8">
        <span className="text-sm font-semibold text-[#0a54ff]">{vote.type}</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{vote.title}</h2>
        {vote.description && <p className="mt-3 text-gray-600">{vote.description}</p>}
        <div className="mt-2 text-sm text-gray-500">
          {isExpired ? `투표가 ${new Date(vote.endDate).toLocaleString()}에 종료되었습니다.` : `마감: ${new Date(vote.endDate).toLocaleString()}`}
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
  );
};

export default VotePage;
