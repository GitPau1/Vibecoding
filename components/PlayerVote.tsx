
import React from 'react';
import { Vote } from '../types';
import { Card } from './ui/Card';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface PlayerVoteProps {
  vote: Vote;
  onVote: (optionId: string) => void;
}

const PlayerVote: React.FC<PlayerVoteProps> = ({ vote, onVote }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center text-gray-800">한 명의 선수를 선택하세요</h3>
      <div className="grid grid-cols-2 gap-4">
        {vote.options?.map((option) => (
          <Card 
            key={option.id} 
            className="p-4 text-center cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            onClick={() => onVote(option.id)}
          >
            {/* Note: This assumes player-like structure in options for display, which is a simplification */}
            <ImageWithFallback 
              src={undefined} // Player photo is not directly in options anymore, can be added if needed
              alt={option.label}
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200"
              fallbackClassName="bg-gray-300"
            />
            <p className="mt-3 font-bold text-gray-900">{option.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerVote;
