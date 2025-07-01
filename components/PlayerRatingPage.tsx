
import React, { useState, useMemo } from 'react';
import { Vote, Player } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useToast } from '../contexts/ToastContext';

interface PlayerRatingPageProps {
    vote: Vote;
    onRate: (voteId: string, ratings: { [playerId: number]: number }) => void;
}

const PlayerRatingPage: React.FC<PlayerRatingPageProps> = ({ vote, onRate }) => {
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const { addToast } = useToast();

    const { starters, substitutes } = useMemo(() => {
        const starters: Player[] = [];
        const substitutes: Player[] = [];
        vote.players?.forEach(p => {
            if (p.isStarter) {
                starters.push(p);
            } else {
                substitutes.push(p);
            }
        });
        return { starters, substitutes };
    }, [vote.players]);

    const totalPlayers = (vote.players || []).length;

    const handleRatingChange = (playerId: number, rating: number) => {
        setRatings(prev => ({ ...prev, [playerId]: rating }));
    };

    const handleSubmit = () => {
        if (Object.keys(ratings).length < totalPlayers) {
            addToast('모든 선수의 평점을 매겨주세요.', 'error');
            return;
        }
        onRate(vote.id, ratings);
    };

    const PlayerRatingInput: React.FC<{ player: Player }> = ({ player }) => {
        const isRated = player.id in ratings;
        const currentRating = ratings[player.id];
        // Use a valid integer for the slider value to ensure it works correctly.
        // The display logic will handle showing '-' for unrated players.
        const sliderValue = isRated ? currentRating : 5;

        return (
            <Card key={player.id} className="p-4 flex flex-col sm:flex-row items-center gap-4">
                <img src={player.photoUrl || `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(player.name)}`} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                <div className="flex-grow text-center sm:text-left">
                    <p className="font-bold text-lg text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.team}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={sliderValue}
                        onChange={(e) => handleRatingChange(player.id, parseInt(e.target.value, 10))}
                        className={`custom-range w-full sm:w-32 ${!isRated ? 'unrated' : ''}`}
                    />
                    <span className={`font-bold text-lg w-12 text-center ${isRated ? 'text-[#0a54ff]' : 'text-gray-400'}`}>{isRated ? currentRating.toFixed(1) : '-'}</span>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">선발 라인업</h3>
                <div className="space-y-3">
                    {starters.map(player => <PlayerRatingInput key={player.id} player={player} />)}
                </div>
            </div>
            {substitutes.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">교체 선수</h3>
                    <div className="space-y-3">
                        {substitutes.map(player => <PlayerRatingInput key={player.id} player={player} />)}
                    </div>
                </div>
            )}
            <div className="mt-8 text-right">
                <Button onClick={handleSubmit} size="lg">평점 제출하기</Button>
            </div>
        </div>
    );
};

export default PlayerRatingPage;