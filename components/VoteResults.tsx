import React, { useState, useEffect, useMemo } from 'react';
import { Vote, VoteKind, Profile } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { UsersIcon } from './icons/UsersIcon';

interface VoteResultsProps {
  vote: Vote;
  isExpired: boolean;
  winners?: Pick<Profile, 'nickname'>[];
  loadingWinners?: boolean;
}

const VoteResults: React.FC<VoteResultsProps> = ({ vote, isExpired, winners, loadingWinners }) => {
  const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);

  const sortedOptions = useMemo(() => {
    return [...vote.options].sort((a, b) => b.votes - a.votes);
  }, [vote.options]);

  const [animatedPercentages, setAnimatedPercentages] = useState<{[key: string]: number}>(
    sortedOptions.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {})
  );

  const maxVotes = useMemo(() => {
    if (sortedOptions.length === 0) return 0;
    return sortedOptions[0].votes;
  }, [sortedOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newPercentages = sortedOptions.reduce((acc, option) => {
        acc[option.id] = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        return acc;
      }, {} as {[key: string]: number});
      setAnimatedPercentages(newPercentages);
    }, 100);

    return () => clearTimeout(timer);
  }, [vote, totalVotes, sortedOptions]);

  const renderMatchResults = () => {
    // If final score is entered, show the definitive result view
    if (vote.finalScore) {
      const [finalA, finalB] = vote.finalScore.split('-');
      const userGuessedCorrectly = vote.userVote === vote.finalScore;

      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg text-center text-gray-800">경기 최종 결과</h3>
            <div className="mt-4 flex items-center justify-center gap-4 p-4 bg-gray-100 rounded-xl">
              <span className="text-2xl md:text-3xl font-bold text-gray-900">{vote.teamA}</span>
              <span className="text-3xl md:text-4xl font-bold text-indigo-600 bg-white px-4 py-2 rounded-lg shadow-sm">{finalA} : {finalB}</span>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">{vote.teamB}</span>
            </div>
          </div>

          {vote.userVote && (
            <div className="p-4 rounded-xl border-2" style={{ borderColor: userGuessedCorrectly ? '#4ade80' : '#f87171', backgroundColor: userGuessedCorrectly ? '#f0fdf4' : '#fef2f2' }}>
              <h4 className="font-semibold text-center" style={{ color: userGuessedCorrectly ? '#166534' : '#b91c1c'}}>
                {userGuessedCorrectly ? '🎉 예측 성공!' : '😢 예측 실패'}
              </h4>
              <p className="text-center text-sm mt-1" style={{ color: userGuessedCorrectly ? '#15803d' : '#991b1b'}}>내 예측: {vote.userVote}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-gray-500" />예측 성공자 명단</h4>
            {loadingWinners ? (
              <p className="text-sm text-gray-500">정답자 목록을 불러오는 중...</p>
            ) : (
              winners && winners.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {winners.map((winner, index) => (
                    <span key={index} className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-md">{winner.nickname}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">아쉽게도 정답자가 없습니다.</p>
              )
            )}
          </div>
        </div>
      )
    }

    // Otherwise, show the live poll results
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">{isExpired ? '스코어 예측 결과' : '현재 예측 현황'}</h3>
        <div className="space-y-3">
          {sortedOptions.slice(0, 10).map((option) => {
            const percentage = animatedPercentages[option.id] || 0;
            const isUserChoice = vote.userVote === option.label;
            const isWinner = isExpired && totalVotes > 0 && option.votes > 0 && option.votes === maxVotes;
            const [scoreA, scoreB] = option.label.split('-');

            return (
              <div key={option.id}>
                 <div className="flex justify-between items-center mb-1 text-sm">
                    <div className="flex items-center font-semibold text-gray-700">
                       {isWinner && <TrophyIcon className="w-5 h-5 text-yellow-500 mr-1.5" />}
                       <span className={`font-bold ${isWinner ? 'text-gray-900' : ''}`}>{vote.teamA}</span>
                       <span className={`mx-2 font-mono px-2 py-0.5 rounded ${isWinner ? 'bg-amber-100 text-amber-800' : 'bg-gray-200'}`}>{scoreA} : {scoreB}</span>
                       <span className={`font-bold ${isWinner ? 'text-gray-900' : ''}`}>{vote.teamB}</span>
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
            );
          })}
          {sortedOptions.length > 10 && <p className="text-center text-xs text-gray-500">상위 10개 결과만 표시됩니다.</p>}
        </div>
      </div>
    );
  };

  const renderDefaultResults = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">{isExpired ? '투표 결과' : '현재 투표 현황'}</h3>
        <div className="space-y-4">
          {sortedOptions.map((option) => {
            const percentage = animatedPercentages[option.id] || 0;
            const isUserChoice = vote.userVote === option.id;
            const isWinner = isExpired && totalVotes > 0 && option.votes > 0 && option.votes === maxVotes;
            const player = vote.type === VoteKind.PLAYER ? vote.players?.find(p => p.name === option.label) : undefined;

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
      </div>
    );
  };

  return (
    <div>
      {vote.type === VoteKind.MATCH ? renderMatchResults() : renderDefaultResults()}
      <p className="text-center text-sm text-gray-500 pt-4 border-t mt-4">총 {totalVotes.toLocaleString()}명이 참여했습니다.</p>
    </div>
  );
};

export default VoteResults;