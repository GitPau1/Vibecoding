

import React from 'react';
import { Vote } from '../types';
import { Button } from './ui/Button';

interface TopicVoteProps {
  vote: Vote;
  onVote: (optionId: string) => void;
}

const TopicVote: React.FC<TopicVoteProps> = ({ vote, onVote }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center text-gray-800">의견을 선택하세요</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {vote.options.map(option => (
          <Button 
            key={option.id}
            onClick={() => onVote(option.id)}
            variant="outline"
            className="w-full sm:w-32 text-lg py-3"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TopicVote;