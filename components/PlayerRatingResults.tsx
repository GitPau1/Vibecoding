
import React, { useMemo } from 'react';
import { PlayerRating, Player } from '../types';
import { Card } from './ui/Card';
import { TrophyIcon } from './icons/TrophyIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface PlayerRatingResultsProps {
    rating: PlayerRating;
    isExpired: boolean;
}

const PlayerRatingResults: React.FC<PlayerRatingResultsProps> = ({ rating, isExpired }) => {
    const { starters, substitutes } = useMemo(() => {
        const starters: Player[] = [];
        const substitutes: Player[] = [];
        rating.players?.forEach(p => {
            if (p.isStarter) {
                starters.push(p);
            } else {
                substitutes.push(p);
            }
        });
        return { starters, substitutes };
    }, [rating.players]);

    const highestAvgRating = useMemo(() => {
        if (!rating.stats || rating.stats.length === 0) return 0;
        return Math.max(0, ...rating.stats.map(r => r.averageRating));
    }, [rating.stats]);
    
    const manOfTheMatch = useMemo(() => {
        if (!isExpired || highestAvgRating <= 0 || !rating.stats) return null;
    
        const momStats = rating.stats.filter(stat => stat.averageRating.toFixed(2) === highestAvgRating.toFixed(2));
        if (momStats.length === 0) return null;

        return rating.players.filter(p => momStats.some(s => s.playerId === p.id));
    
    }, [isExpired, highestAvgRating, rating.stats, rating.players]);
    
    const totalRaters = rating.stats?.[0]?.ratingCount || 0;

    const PlayerResultRow: React.FC<{ player: Player }> = ({ player }) => {
        const ratingStat = rating.stats?.find(s => s.playerId === player.id);
        const userSubmission = rating.userSubmission?.find(s => s.playerId === player.id);
        const isHighest = ratingStat && ratingStat.averageRating > 0 && ratingStat.averageRating.toFixed(2) === highestAvgRating.toFixed(2);
        
        const playerComments = rating.stats?.find(s => s.playerId === player.id)?.comments || [];

        return (
             <Card className={`p-4 transition-all ${isExpired && isHighest ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {isExpired && isHighest && <TrophyIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                        <ImageWithFallback src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-bold text-gray-900 truncate">{player.name}</p>
                            <p className="text-sm text-gray-500 truncate">{player.team}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                        <p className="text-xl font-bold text-indigo-600">{ratingStat ? ratingStat.averageRating.toFixed(2) : 'N/A'}</p>
                        <p className="text-xs text-gray-500">평균</p>
                    </div>
                </div>
                {userSubmission && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-gray-700">
                                내 평점: <span className="text-lg font-bold text-gray-900">{userSubmission.rating.toFixed(1)}</span>
                            </p>
                            {userSubmission.comment && (
                                <p className="text-sm text-gray-600 text-right pl-4 flex-1 italic">“{userSubmission.comment}”</p>
                            )}
                        </div>
                    </div>
                )}
                {playerComments.length > 0 && (
                    <details className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-800">한 줄 평 보기 ({playerComments.length})</summary>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                            {playerComments.map((comment, index) => (
                                <p key={index} className="text-gray-700 bg-gray-100 p-2 rounded-md">“{comment}”</p>
                            ))}
                        </div>
                    </details>
                )}
            </Card>
        );
    };

    return (
        <div className="space-y-6">
             {manOfTheMatch && manOfTheMatch.length > 0 && (
                <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-6 mb-6">
                    <div className="text-center">
                        <TrophyIcon className="w-10 h-10 mx-auto mb-2 text-white drop-shadow-lg"/>
                        <h4 className="text-lg font-semibold tracking-widest uppercase">Man of the Match</h4>
                        <div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
                            {manOfTheMatch.map(player => (
                                <div key={player.id} className="flex flex-col items-center">
                                    <ImageWithFallback src={player.photoUrl} alt={player.name} className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-lg" />
                                    <p className="mt-2 text-xl font-bold">{player.name}</p>
                                </div>
                            ))}
                        </div>
                         <p className="mt-2 text-2xl font-bold tracking-tight">Avg. {highestAvgRating.toFixed(2)}</p>
                    </div>
                </Card>
            )}

            <div>
                <h3 className="font-semibold text-lg text-gray-800">선수 평점 결과</h3>
                <p className="text-sm text-gray-500">총 {totalRaters.toLocaleString()}명이 참여했습니다.</p>
            </div>
            
            {starters.length > 0 && <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">선발 라인업</h4>
                <div className="space-y-3">
                    {starters.map(player => <PlayerResultRow key={player.id} player={player} />)}
                </div>
            </div>}

            {substitutes.length > 0 && (
                <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-4">교체 선수</h4>
                    <div className="space-y-3">
                        {substitutes.map(player => <PlayerResultRow key={player.id} player={player} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerRatingResults;
