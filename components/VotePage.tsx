

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, VoteKind, VoteOption, Profile } from '../types';
import { Card } from './ui/Card';
import ScoreVote from './ScoreVote';
import PlayerVote from './PlayerVote';
import TopicVote from './TopicVote';
import VoteResults from './VoteResults';
import PlayerRatingPage from './PlayerRatingPage';
import PlayerRatingResults from './PlayerRatingResults';
import { TrophyIcon } from './icons/TrophyIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabaseClient';

interface VotePageProps {
  allItems: Vote[];
  onVote: (voteId: string, optionId: string) => void;
  onRatePlayers: (voteId: string, ratings: { [playerId: number]: { rating: number; comment: string | null; }; }) => void;
  onUpdateScoreVote: (voteId: string, score: string) => void;
  onEnterResult: (voteId: string, finalScore: string) => void;
  onRequestLogin: () => void;
}

const EnterResultForm: React.FC<{ vote: Vote, onEnterResult: (voteId: string, finalScore: string) => void }> = ({ vote, onEnterResult }) => {
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const { addToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (scoreA < 0 || scoreB < 0) {
            addToast("스코어는 0 이상이어야 합니다.", 'error');
            return;
        }
        if (window.confirm(`경기 결과를 ${scoreA}:${scoreB}로 확정하시겠습니까? 결과 입력 후 투표는 즉시 종료되며, 수정할 수 없습니다.`)) {
            onEnterResult(vote.id, `${scoreA}-${scoreB}`);
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
            <h3 className="font-bold text-center text-indigo-800">경기 결과 입력</h3>
            <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                    <label className="block font-semibold text-gray-700 mb-1">{vote.teamA}</label>
                    <Input type="number" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} min="0" className="w-24 text-center"/>
                </div>
                <span className="text-2xl font-bold pt-6">:</span>
                 <div className="text-center">
                    <label className="block font-semibold text-gray-700 mb-1">{vote.teamB}</label>
                    <Input type="number" value={scoreB} onChange={e => setScoreB(Number(e.target.value))} min="0" className="w-24 text-center"/>
                </div>
            </div>
            <Button type="submit" className="w-full">결과 확정 및 투표 종료</Button>
        </form>
    );
};

const VotePage: React.FC<VotePageProps> = ({ allItems, onVote, onRatePlayers, onUpdateScoreVote, onEnterResult, onRequestLogin }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addToast } = useToast();
  
  const [winners, setWinners] = useState<Pick<Profile, 'nickname'>[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);

  const vote = allItems.find(v => v.id === id);

  useEffect(() => {
    if (!vote && allItems && allItems.length > 0) {
      navigate('/', { replace: true });
    }
  }, [vote, allItems, navigate]);
  
  useEffect(() => {
    const fetchWinners = async () => {
      if (supabase && vote && vote.type === VoteKind.MATCH && vote.finalScore) {
        setLoadingWinners(true);
        try {
          const { data, error } = await supabase
            .from('user_votes')
            .select('profiles ( nickname )')
            .eq('vote_id', vote.id)
            .eq('vote_value', vote.finalScore);

          if (error) throw error;

          const winnerProfiles = data.map((item: any) => item.profiles).filter(Boolean);
          setWinners(winnerProfiles as Pick<Profile, 'nickname'>[]);

        } catch (error: any) {
          addToast(`정답자 목록 로딩 실패: ${error.message}`, 'error');
        } finally {
          setLoadingWinners(false);
        }
      }
    };
    fetchWinners();
  }, [vote, addToast]);

  if (!vote) {
    return null;
  }

  const isCreator = !!session && session.user.id === vote.user_id;
  const isExpired = new Date(vote.endDate) < new Date();
  
  const canEnterResult = vote.type === VoteKind.MATCH && isCreator && !vote.finalScore && !isExpired;

  const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);
  let winnerOption: VoteOption | undefined = undefined;

  if (isExpired && totalVotes > 0 && vote.type !== VoteKind.RATING) {
    const maxVotes = Math.max(...vote.options.map(o => o.votes));
    const winners = vote.options.filter(o => o.votes === maxVotes);
    if (winners.length === 1) {
      winnerOption = winners[0];
    }
  }

  const MainContent = () => {
    if (vote.type === VoteKind.RATING) {
        const hasVoted = vote.userRatings !== undefined;
        const showResultsView = viewingResults || (session && (hasVoted || isExpired));

        if (showResultsView) {
            return <PlayerRatingResults vote={vote} isExpired={isExpired} />;
        }
        
        return <PlayerRatingPage 
                vote={vote}
                onRate={onRatePlayers}
                isGuest={!session}
                onRequestLogin={onRequestLogin}
                onShowResults={() => setViewingResults(true)}
               />;
    }

    // For other vote types (MATCH, PLAYER, TOPIC)
    const hasVoted = vote.userVote !== undefined;
    const showResults = hasVoted || isExpired || !!vote.finalScore;

    if (showResults) {
        return <VoteResults vote={vote} isExpired={isExpired || !!vote.finalScore} winners={winners} loadingWinners={loadingWinners} />;
    }

    switch (vote.type) {
        case VoteKind.MATCH:
            return <ScoreVote vote={vote} onVote={(scoreString) => onUpdateScoreVote(vote.id, scoreString)} />;
        case VoteKind.PLAYER:
            return <PlayerVote vote={vote} onVote={(optionId) => onVote(vote.id, optionId)} />;
        case VoteKind.TOPIC:
            return <TopicVote vote={vote} onVote={(optionId) => onVote(vote.id, optionId)} />;
        default:
            return <p>Unknown vote type</p>;
    }
  };
  
  const renderWinnerLabel = () => {
      if (!winnerOption) return null;
      if (vote.type === VoteKind.MATCH) { // This will now only show for non-finalized results
          const [scoreA, scoreB] = winnerOption.label.split('-');
          return (
            <div className="flex items-center justify-center gap-4">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{vote.teamA}</span>
                <span className="text-2xl md:text-3xl font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">{scoreA} : {scoreB}</span>
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{vote.teamB}</span>
            </div>
          );
      }
      return <p className="text-2xl md:text-3xl font-bold text-gray-900">{winnerOption.label}</p>
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
            {isExpired || vote.finalScore ? `투표가 ${new Date(vote.endDate).toLocaleString()}에 종료되었습니다.` : `마감: ${new Date(vote.endDate).toLocaleString()}`}
          </div>
        </div>

        {winnerOption && renderWinnerLabel() && (
          <div className="border-t border-gray-200 bg-amber-50 p-6">
            <div className="text-center">
              <div className="flex justify-center items-center text-amber-600 mb-2">
                <TrophyIcon className="w-6 h-6 mr-2" />
                <p className="font-semibold text-base">{vote.type === VoteKind.MATCH ? "현재 1위 예측" : "투표 최종 1위"}</p>
              </div>
              {renderWinnerLabel()}
            </div>
          </div>
        )}

        {canEnterResult && (
            <div className="p-6 md:p-8 border-t border-gray-100">
                <EnterResultForm vote={vote} onEnterResult={onEnterResult} />
            </div>
        )}

        <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-100">
          <MainContent />
        </div>
      </Card>
    </div>
  );
};

export default VotePage;
