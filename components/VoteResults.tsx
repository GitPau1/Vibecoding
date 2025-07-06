import React, { useState, useEffect } from 'react';
import { Vote, VoteKind } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface VoteResultsProps {
  vote: Vote;
  isExpired: boolean;
}

const VoteResults: React.FC<VoteResultsProps> = ({ vote, isExpired }) => {
  const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);
  const [animatedPercentages, setAnimatedPercentages] = useState<number[]>(vote.options.map(() => 0));
  const [maxVotes, setMaxVotes] = useState(0);

  useEffect(() => {
    if (vote.options.length > 0) {
      const voteCounts = vote.options.map(o => o.votes);
      setMaxVotes(Math.max(...voteCounts));
    }
    const timer = setTimeout(() => {
      const newPercentages = vote.options.map(option =>
        totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
      );
      setAnimatedPercentages(newPercentages);
    }, 100);

    return () => clearTimeout(timer);
  }, [vote, totalVotes]);


  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">{isExpired ? '투표 결과' : '현재 투표 현황'}</h3>
      <div className="space-y-4">
        {vote.options.map((option, index) => {
          const percentage = animatedPercentages[index];
          const isUserChoice = vote.userVote === option.id;
          const isWinner = isExpired && totalVotes > 0 && option.votes > 0 && option.votes === maxVotes;
          const player = vote.type === VoteKind.PLAYER ? vote.players?.[index] : undefined;

          return (
            <div key={option.id} className={player ? 'flex items-center gap-4' : ''}>
               {player && (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                />
              )}
              <div className="w-full flex-grow">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <div className="flex items-center font-semibold text-gray-700">
                    {isWinner && !player && <TrophyIcon className="w-5 h-5 text-yellow-500 mr-1.5" />}
                    <span className={isWinner ? 'text-gray-900' : ''}>{option.label}</span>
                    {isUserChoice && <CheckIcon className="w-4 h-4 text-[#6366f1] ml-2" />}
                  </div>
                  <span className={`font-bold ${isWinner ? 'text-gray-900' : 'text-gray-800'}`}>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`${isWinner ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-[#6366f1]'} h-4 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {option.votes.toLocaleString()} 표
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-500 pt-2">총 {totalVotes.toLocaleString()}명이 참여했습니다.</p>
    </div>
  );
};

export default VoteResults;