

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Match, SquadPlayer, Vote } from '../types';
import { MatchCreationData, MatchResultData } from '../App';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import MatchFormModal from './MatchFormModal';
import MatchResultModal from './MatchResultModal';
import { KebabMenuIcon } from './icons/KebabMenuIcon';

interface MatchManagementPageProps {
  matches: Match[];
  ratings: Vote[];
  squadPlayers: SquadPlayer[];
  onCreateMatch: (matchData: MatchCreationData) => void;
  onUpdateMatch: (matchId: string, matchData: MatchCreationData) => void;
  onDeleteMatch: (matchId: string) => void;
  onSubmitMatchResult: (matchId: string, resultData: MatchResultData) => void;
}

const MatchManagementPage: React.FC<MatchManagementPageProps> = ({ matches, ratings, squadPlayers, onCreateMatch, onUpdateMatch, onDeleteMatch, onSubmitMatchResult }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // This effect will update the current time every minute, forcing the component
  // to re-evaluate which matches are upcoming vs. finished.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds
    return () => clearInterval(timer);
  }, []);

  const { upcomingMatches, finishedMatches } = useMemo(() => {
    const now = currentTime; // Use state for live updates
    const upcoming: Match[] = [];
    const finished: Match[] = [];
    matches.forEach(match => {
      // Use is_finished flag primarily, then fall back to time check
      if (match.is_finished || new Date(match.match_time) <= now) {
        finished.push(match);
      } else {
        upcoming.push(match);
      }
    });
    return { 
        upcomingMatches: upcoming.sort((a,b) => new Date(a.match_time).getTime() - new Date(b.match_time).getTime()),
        finishedMatches: finished.sort((a,b) => new Date(b.match_time).getTime() - new Date(a.match_time).getTime())
    };
  }, [matches, currentTime]); // Add currentTime to dependency array
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenFormModal = (match: Match | null) => {
    setSelectedMatch(match);
    setIsFormModalOpen(true);
    setOpenMenuId(null);
  };
  
  const handleOpenResultModal = (match: Match) => {
    setSelectedMatch(match);
    setIsResultModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveMatch = (matchData: MatchCreationData, id?: string) => {
    if (id) {
        onUpdateMatch(id, matchData);
    } else {
        onCreateMatch(matchData);
    }
    setIsFormModalOpen(false);
    setSelectedMatch(null);
  };
  
  const handleSaveResult = (resultData: MatchResultData) => {
    if (selectedMatch) {
      onSubmitMatchResult(selectedMatch.id, resultData);
    }
    setIsResultModalOpen(false);
    setSelectedMatch(null);
  };
  
  const handleDeleteClick = (matchId: string) => {
    onDeleteMatch(matchId);
    setOpenMenuId(null);
  }

  const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
    const hasResult = match.home_score !== null && match.away_score !== null;
    const isConsideredFinished = match.is_finished || new Date(match.match_time) <= currentTime;

    return (
        <Card className="p-4 flex items-center gap-4">
            <div className="flex-grow">
                <p className="text-sm text-gray-500">{match.competition}</p>
                <p className="text-xl font-bold my-1 truncate">{match.home_team} vs {match.away_team}</p>
                <p className="text-sm text-gray-600 font-medium">
                    {new Date(match.match_time).toLocaleString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                {isConsideredFinished ? (
                    hasResult ? (
                        <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold text-gray-800">{match.home_score}</p>
                            <p className="text-2xl font-bold text-gray-400">:</p>
                            <p className="text-3xl font-bold text-gray-800">{match.away_score}</p>
                            <Button variant="outline" onClick={() => handleOpenResultModal(match)} size="sm">결과 수정</Button>
                        </div>
                    ) : (
                        <Button onClick={() => handleOpenResultModal(match)} size="sm">결과 입력</Button>
                    )
                ) : (
                    <span className="text-sm font-semibold text-blue-600">예정</span>
                )}
                <div className="relative" ref={openMenuId === match.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === match.id ? null : match.id)} className="p-2 rounded-full hover:bg-gray-100">
                        <KebabMenuIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    {openMenuId === match.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            {!isConsideredFinished && (
                                <button onClick={() => handleOpenFormModal(match)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">수정</button>
                            )}
                            <button onClick={() => handleDeleteClick(match.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">삭제</button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

  return (
    <>
      {isFormModalOpen && (
        <MatchFormModal 
            matchToEdit={selectedMatch} 
            onClose={() => setIsFormModalOpen(false)} 
            onSave={handleSaveMatch} 
        />
      )}
      {isResultModalOpen && selectedMatch && (
         <MatchResultModal
            match={selectedMatch}
            ratings={ratings}
            squadPlayers={squadPlayers}
            onClose={() => setIsResultModalOpen(false)}
            onSave={handleSaveResult}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">경기 관리</h2>
            <p className="text-gray-500 mt-2">경기를 생성하고 결과를 입력합니다. 관련 콘텐츠가 자동으로 생성됩니다.</p>
          </div>
          <Button onClick={() => handleOpenFormModal(null)} size="lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            새 경기 생성
          </Button>
        </div>

        <div className="space-y-10">
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#6366f1]">진행 예정 경기</h3>
              {upcomingMatches.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-10 px-6 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">진행 예정인 경기가 없습니다.</p>
                 </div>
              )}
            </section>
            
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#6366f1]">종료된 경기</h3>
              {finishedMatches.length > 0 ? (
                <div className="space-y-4">
                  {finishedMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-6 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">종료된 경기가 없습니다.</p>
                 </div>
              )}
            </section>
        </div>

      </div>
    </>
  );
};

export default MatchManagementPage;