
import React, { useState } from 'react';
import { PlayerRating, Player, PlayerRatingSubmission } from '../types';
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
    rating: PlayerRating;
    onRate: (ratingId: string, submissions: Omit<PlayerRatingSubmission, 'userId' | 'ratingId'>[]) => void;
    isGuest?: boolean;
    onRequestLogin?: () => void;
    onShowResults?: () => void;
}

const PlayerRatingPage: React.FC<PlayerRatingPageProps> = ({ rating, onRate, isGuest, onRequestLogin, onShowResults }) => {
    const [submissions, setSubmissions] = useState<{ [key: number]: { rating: number; comment: string | null } }>({});
    const { addToast } = useToast();

    const totalPlayers = (rating.players || []).length;

    const handleRatingChange = (playerId: number, newRating: number) => {
        setSubmissions(prev => ({
            ...prev,
            [playerId]: {
                rating: newRating,
                comment: prev[playerId]?.comment || null
            }
        }));
    };

    const handleCommentChange = (playerId: number, comment: string) => {
        setSubmissions(prev => {
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
        const ratedPlayersCount = Object.values(submissions).filter(r => r.rating !== undefined).length;
        if (ratedPlayersCount < totalPlayers) {
            addToast('모든 선수의 평점을 매겨주세요.', 'error');
            return;
        }
        
        const submissionsPayload = Object.entries(submissions).map(([playerId, data]) => ({
            playerId: Number(playerId),
            rating: data.rating,
            comment: data.comment,
        }));

        onRate(rating.id, submissionsPayload);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                {rating.players?.map((player, index) => {
                    const prevPlayer = rating.players?.[index - 1];
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
                                ratingData={submissions[player.id]}
                                onRatingChange={handleRatingChange}
                                onCommentChange={handleCommentChange}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
            
            {isGuest ? (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={onShowResults} variant="outline" size="lg">결과 보기</Button>
                    <Button onClick={onRequestLogin} size="lg">평점 제출하기</Button>
                </div>
            ) : (
                <div className="mt-8 text-right">
                    <Button onClick={handleSubmit} size="lg">평점 제출하기</Button>
                </div>
            )}
        </div>
    );
};

export default PlayerRatingPage;
