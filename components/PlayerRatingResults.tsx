import React, { useMemo } from 'react';
import { Vote, Player } from '../types';
import { Card } from './ui/Card';
import { TrophyIcon } from './icons/TrophyIcon';

interface PlayerRatingResultsProps {
    vote: Vote;
}

const PlayerRatingResults: React.FC<PlayerRatingResultsProps> = ({ vote }) => {
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
        const ratings: { [id: number]: { avg: number, count: number } } = {};
        vote.options.forEach(opt => {
            if (opt.ratingCount && opt.ratingCount > 0) {
                ratings[opt.id] = {
                    avg: opt.votes / opt.ratingCount,
                    count: opt.ratingCount
                };
            }
        });
        return ratings;
    }, [vote.options]);

    const highestAvgRating = useMemo(() => {
        return Math.max(0, ...Object.values(playerRatings).map(r => r.avg));
    }, [playerRatings]);

    const totalRaters = vote.options[0]?.ratingCount || 0;

    const PlayerResultRow: React.FC<{ player: Player }> = ({ player }) => {
        const ratingInfo = playerRatings[player.id];
        const userRating = vote.userRatings?.[player.id];
        const isHighest = ratingInfo && ratingInfo.avg.toFixed(2) === highestAvgRating.toFixed(2) && highestAvgRating > 0;


        return (
             <Card className={`p-4 flex flex-col sm:flex-row items-center gap-4 transition-all ${isHighest ? 'bg-amber-50 border-amber-300' : ''}`}>
                <img src={player.photoUrl || `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(player.name)}`} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                <div className="flex-grow text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                        {isHighest && <TrophyIcon className="w-5 h-5 text-amber-500" />}
                        <p className="font-bold text-lg text-gray-900">{player.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{player.team}</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{ratingInfo ? ratingInfo.avg.toFixed(2) : 'N/A'}</p>
                    <p className="text-xs text-gray-500">평균 평점</p>
                </div>
                {userRating !== undefined && (
                    <div className="text-center sm:pl-4 sm:ml-4 sm:border-l border-gray-200 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                        <p className="text-2xl font-bold text-[#0a54ff]">{userRating.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">내 평점</p>
                    </div>
                )}
            </Card>
        );
    };

    return (
        <div className="space-y-6">
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
