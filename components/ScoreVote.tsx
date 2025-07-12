

import React, { useState, useEffect } from 'react';
import { Vote } from '../types';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

interface ScoreVoteProps {
  vote: Vote;
  onVote: (scoreString: string) => void;
}

const ScoreVote: React.FC<ScoreVoteProps> = ({ vote, onVote }) => {
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);

  useEffect(() => {
    if (vote.userVote) {
      const scores = vote.userVote.split('-');
      if (scores.length === 2) {
        setScoreA(parseInt(scores[0], 10) || 0);
        setScoreB(parseInt(scores[1], 10) || 0);
      }
    }
  }, [vote.userVote]);


  const handleScoreChange = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setter(prev => {
      const newValue = prev + delta;
      if (newValue >= 0 && newValue <= 99) {
        return newValue;
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVote(`${scoreA}-${scoreB}`);
  };

  const StepperButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
      type="button"
      className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366f1]"
      {...props}
    >
      {children}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-semibold text-lg text-center text-gray-800">스코어를 예측해주세요</h3>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-y-4">
        {/* Team A Stepper */}
        <div className="w-full sm:w-auto text-center space-y-3">
          <label className="block font-bold text-gray-800 text-lg truncate">{vote.teamA}</label>
          <div className="flex items-center justify-center space-x-3">
            <StepperButton onClick={() => handleScoreChange(setScoreA, -1)} disabled={scoreA <= 0} aria-label={`${vote.teamA} 점수 감소`}>
              <MinusIcon className="w-6 h-6" />
            </StepperButton>
            <span className="text-5xl md:text-6xl font-bold text-gray-900 w-20 text-center tabular-nums" aria-live="polite">
              {scoreA}
            </span>
            <StepperButton onClick={() => handleScoreChange(setScoreA, 1)} disabled={scoreA >= 99} aria-label={`${vote.teamA} 점수 증가`}>
              <PlusIcon className="w-6 h-6" />
            </StepperButton>
          </div>
        </div>
        
        <div className="text-4xl sm:text-5xl font-bold text-gray-400 hidden sm:block sm:pt-10">:</div>

        {/* Team B Stepper */}
        <div className="w-full sm:w-auto text-center space-y-3">
          <label className="block font-bold text-gray-800 text-lg truncate">{vote.teamB}</label>
          <div className="flex items-center justify-center space-x-3">
            <StepperButton onClick={() => handleScoreChange(setScoreB, -1)} disabled={scoreB <= 0} aria-label={`${vote.teamB} 점수 감소`}>
              <MinusIcon className="w-6 h-6" />
            </StepperButton>
            <span className="text-5xl md:text-6xl font-bold text-gray-900 w-20 text-center tabular-nums" aria-live="polite">
              {scoreB}
            </span>
            <StepperButton onClick={() => handleScoreChange(setScoreB, 1)} disabled={scoreB >= 99} aria-label={`${vote.teamB} 점수 증가`}>
              <PlusIcon className="w-6 h-6" />
            </StepperButton>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg">
          {vote.userVote ? '예측 수정하기' : '예측 제출하기'}
        </Button>
      </div>
    </form>
  );
};

export default ScoreVote;