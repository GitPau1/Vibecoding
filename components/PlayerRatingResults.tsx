

import React, { useMemo } from 'react';
import { Vote, Player } from '../types';
import { Card } from './ui/Card';
import { TrophyIcon } from './icons/TrophyIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface PlayerRatingResultsProps {
    vote: Vote;
    isExpired: boolean;
}

const PlayerRatingResults: React.FC<PlayerRatingResultsProps> = ({ vote, isExpired }) => {
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

    const playerRatings = useMemo(() => {
        const ratings: { [playerId: number]: { avg: number; count: number } } = {};
        if (!vote.players) return ratings;
        
        vote.options.forEach(option => {
            const player = vote.players.find(p => p.name === option.label);
            if (player && option.ratingCount && option.ratingCount > 0) {
                ratings[player.id] = {
                    avg: option.votes / option.ratingCount,
                    count: option.ratingCount
                };
            }
        });
        return ratings;
    }, [vote.options, vote.players]);

    const highestAvgRating = useMemo(() => {
        return Math.max(0, ...Object.values(playerRatings).map(r => r.avg));
    }, [playerRatings]);
    
    const manOfTheMatch = useMemo(() => {
        if (!isExpired || highestAvgRating <= 0) return null;
    
        const momPlayers = vote.players?.filter(p => {
            const ratingInfo = playerRatings[p.id];
            return ratingInfo && ratingInfo.avg.toFixed(2) === highestAvgRating.toFixed(2);
        }) || [];
    
        return momPlayers; // Return array of players
    }, [isExpired, highestAvgRating, playerRatings, vote.players]);
    
    const groupedComments = useMemo(() => {
        if (!vote.players) return [];

        const commentsByPlayer: { [playerName: string]: string[] } = {};
        vote.options.forEach(option => {
            const player = vote.players.find(p => p.name === option.label);
            if (player && option.comments && Array.isArray(option.comments) && option.comments.length > 0) {
                 if (!commentsByPlayer[player.name]) {
                    commentsByPlayer[player.name] = [];
                }
                const validComments = option.comments.filter(c => typeof c === 'string' && c.trim() !== '');
                if(validComments.length > 0) {
                    commentsByPlayer[player.name].push(...validComments);
                }
            }
        });
        return Object.entries(commentsByPlayer)
            .map(([playerName, comments]) => ({
                playerName,
                comments
            }))
            .filter(group => group.comments.length > 0);
    }, [vote.options, vote.players]);

    const totalRaters = vote.options[0]?.ratingCount || 0;

    const PlayerResultRow: React.FC<{ player: Player }> = ({ player }) => {
        const ratingInfo = playerRatings[player.id];
        const userRatingInfo = vote.userRatings?.[player.id];
        const isHighest = ratingInfo && ratingInfo.avg > 0 && ratingInfo.avg.toFixed(2) === highestAvgRating.toFixed(2);

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
                        <p className="text-xl font-bold text-indigo-600">{ratingInfo ? ratingInfo.avg.toFixed(2) : 'N/A'}</p>
                        <p className="text-xs text-gray-500">평균</p>
                    </div>
                </div>
                {userRatingInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold text-gray-700">
                                내 평점: <span className="text-lg font-bold text-gray-900">{userRatingInfo.rating.toFixed(1)}</span>
                            </p>
                            {userRatingInfo.comment && (
                                <p className="text-sm text-gray-600 text-right pl-4 flex-1 italic">“{userRatingInfo.comment}”</p>
                            )}
                        </div>
                    </div>
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
            
            {groupedComments.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">팬들의 한 줄 평</h3>
                    <div className="space-y-4">
                       {groupedComments.map(({ playerName, comments }) => (
                           <div key={playerName}>
                               <h4 className="font-bold text-md text-gray-800 mb-2">{playerName}</h4>
                               <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                   {comments.map((comment, index) => (
                                       <Card key={index} className="p-3 bg-gray-50/80">
                                           <p className="text-sm text-gray-800">“ {comment} ”</p>
                                       </Card>
                                   ))}
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerRatingResults;