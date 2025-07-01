
import React from 'react';
import { Vote } from '../types';
import { Card } from './ui/Card';

interface PlayerVoteProps {
  vote: Vote;
  onVote: (optionId: number) => void;
}

const PlayerVote: React.FC<PlayerVoteProps> = ({ vote, onVote }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-center text-gray-800">한 명의 선수를 선택하세요</h3>
      <div className="grid grid-cols-2 gap-4">
        {vote.players?.map((player, index) => (
          <Card 
            key={player.id} 
            className="p-4 text-center cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            onClick={() => onVote(vote.options[index].id)}
          >
            <img 
              src={player.photoUrl} 
              alt={player.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200"
            />
            <p className="mt-3 font-bold text-gray-900">{player.name}</p>
            <p className="text-sm text-gray-500">{player.team}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerVote;
