
import React from 'react';
import { Vote } from '../types';
import { Button } from './ui/Button';

interface MatchVoteProps {
  vote: Vote;
  onVote: (optionId: string) => void;
}

const MatchVote: React.FC<MatchVoteProps> = ({ vote, onVote }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center text-gray-800">승/무/패를 선택하세요</h3>
      <div className="grid grid-cols-3 gap-3">
        {vote.options.map(option => (
          <Button 
            key={option.id} 
            onClick={() => onVote(option.id)}
            variant="outline"
            className="w-full text-base py-4 h-auto"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MatchVote;