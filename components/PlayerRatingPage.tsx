

import React, { useState } from 'react';
import { Vote, Player } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useToast } from '../contexts/ToastContext';
import { Input } from './ui/Input';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface PlayerRatingInputProps {
    player: Player;
    ratingData: { rating: number; comment: string | null } | undefined;
    onRatingChange: (playerId: number, rating: number) => void;
    onCommentChange: (playerId: number, comment: string) => void;
}

const PlayerRatingInput: React.FC<PlayerRatingInputProps> = React.memo(({ player, ratingData, onRatingChange, onCommentChange }) => {
    const isRated = ratingData?.rating !== undefined;
    const currentRating = ratingData?.rating;
    const currentComment = ratingData?.comment;
    const sliderValue = isRated ? currentRating! : 5;

    return (
        <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <ImageWithFallback src={player.photoUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                <div className="flex-grow text-center sm:text-left">
                    <p className="font-bold text-lg text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.team}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={sliderValue}
                        onChange={(e) => onRatingChange(player.id, parseFloat(e.target.value))}
                        className={`custom-range w-full sm:w-32 ${!isRated ? 'unrated' : ''}`}
                    />
                    <span className={`font-bold text-lg w-12 text-center ${isRated ? 'text-[#6366f1]' : 'text-gray-400'}`}>{isRated ? currentRating?.toFixed(1) : '-'}</span>
                </div>
            </div>
            {isRated && (
                <div className="mt-3 sm:pl-[calc(4rem+1rem)]">
                     <Input
                        type="text"
                        placeholder="한 줄 평을 입력하세요 (선택 사항)"
                        value={currentComment || ''}
                        onChange={(e) => onCommentChange(player.id, e.target.value)}
                        className="text-sm"
                        maxLength={50}
                     />
                </div>
            )}
        </Card>
    );
});


interface PlayerRatingPageProps {
    vote: Vote;
    onRate: (voteId: string, ratings: { [playerId: number]: { rating: number; comment: string | null; }; }) => void;
}

const PlayerRatingPage: React.FC<PlayerRatingPageProps> = ({ vote, onRate }) => {
    const [ratings, setRatings] = useState<{ [key: number]: { rating: number; comment: string | null } }>({});
    const { addToast } = useToast();

    const totalPlayers = (vote.players || []).length;

    const handleRatingChange = (playerId: number, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [playerId]: {
                rating: rating,
                comment: prev[playerId]?.comment || null
            }
        }));
    };

    const handleCommentChange = (playerId: number, comment: string) => {
        setRatings(prev => {
            if (!prev[playerId]) {
                return prev;
            }
            return {
                ...prev,
                [playerId]: {
                    ...prev[playerId],
                    comment: comment,
                }
            };
        });
    };

    const handleSubmit = () => {
        const ratedPlayersCount = Object.values(ratings).filter(r => r.rating !== undefined).length;
        if (ratedPlayersCount < totalPlayers) {
            addToast('모든 선수의 평점을 매겨주세요.', 'error');
            return;
        }
        onRate(vote.id, ratings);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                {vote.players?.map((player, index) => {
                    const prevPlayer = vote.players?.[index - 1];
                    const isFirstStarter = player.isStarter && (index === 0 || !prevPlayer?.isStarter);
                    const isFirstSubstitute = !player.isStarter && (index === 0 || !!prevPlayer?.isStarter);

                    return (
                        <React.Fragment key={player.id}>
                            {isFirstStarter && (
                                <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">선발 라인업</h3>
                            )}
                            {isFirstSubstitute && (
                                <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">교체 선수</h3>
                            )}
                            <PlayerRatingInput 
                                player={player} 
                                ratingData={ratings[player.id]}
                                onRatingChange={handleRatingChange}
                                onCommentChange={handleCommentChange}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="mt-8 text-right">
                <Button onClick={handleSubmit} size="lg">평점 제출하기</Button>
            </div>
        </div>
    );
};

export default PlayerRatingPage;