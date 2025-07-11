


import React, { useState, useCallback, useEffect } from 'react';
import { Match, SquadPlayer, Player, Vote } from '../types';
import { MatchResultData } from '../App';
import { Button } from './ui/Button';
import { XIcon } from './icons/XIcon';
import { Input } from './ui/Input';
import LoadFromSquadModal from './LoadFromSquadModal';
import { UsersIcon } from './icons/UsersIcon';
import { useToast } from '../contexts/ToastContext';

interface MatchResultModalProps {
  match: Match;
  ratings: Vote[];
  squadPlayers: SquadPlayer[];
  onClose: () => void;
  onSave: (resultData: MatchResultData) => void;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ match, ratings, squadPlayers, onClose, onSave }) => {
  const isEditMode = match.home_score !== null && match.away_score !== null;
  
  const [homeScore, setHomeScore] = useState<number | ''>(isEditMode ? match.home_score! : '');
  const [awayScore, setAwayScore] = useState<number | ''>(isEditMode ? match.away_score! : '');
  const [starters, setStarters] = useState<Player[]>([]);
  const [substitutes, setSubstitutes] = useState<Player[]>([]);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const { addToast } = useToast();
  
  useEffect(() => {
    if (isEditMode) {
      const existingRating = ratings.find(r => r.match_id === match.id);
      if (existingRating && existingRating.players) {
        setStarters(existingRating.players.filter(p => p.isStarter));
        setSubstitutes(existingRating.players.filter(p => !p.isStarter));
      }
    }
  }, [isEditMode, match.id, ratings]);


  const handleLoadFromSquad = (loadedPlayers: {player: SquadPlayer, isStarter: boolean}[]) => {
    const newStarters: Player[] = loadedPlayers
        .filter(p => p.isStarter)
        .map((p, i) => ({ id: i, name: p.player.name, team: match.home_team, photoUrl: p.player.photoUrl, isStarter: true }));
    const newSubstitutes: Player[] = loadedPlayers
        .filter(p => !p.isStarter)
        .map((p, i) => ({ id: newStarters.length + i, name: p.player.name, team: match.home_team, photoUrl: p.player.photoUrl, isStarter: false }));
    
    setStarters(newStarters);
    setSubstitutes(newSubstitutes);
    setIsSquadModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeScore === '' || awayScore === '') {
        addToast('스코어를 입력해주세요.', 'error');
        return;
    }
    if (starters.length === 0) {
        addToast('최소 한 명 이상의 선발 선수를 입력해야 합니다.', 'error');
        return;
    }
    
    const allPlayers = [...starters, ...substitutes];
    
    onSave({
        home_score: Number(homeScore),
        away_score: Number(awayScore),
        players: allPlayers,
    });
  };

  const PlayerList: React.FC<{ players: Player[], title: string }> = ({ players, title }) => (
    <div>
      <h4 className="text-md font-semibold text-gray-700 mb-2">{title} ({players.length}명)</h4>
      <div className="space-y-2">
        {players.map(p => (
          <div key={p.id} className="p-2 bg-gray-100 rounded-md text-sm">{p.name}</div>
        ))}
        {players.length === 0 && <p className="text-xs text-gray-400 p-2">선수가 없습니다.</p>}
      </div>
    </div>
  );

  return (
    <>
    {isSquadModalOpen && (
        <LoadFromSquadModal
            squadPlayers={squadPlayers}
            onClose={() => setIsSquadModalOpen(false)}
            onConfirm={handleLoadFromSquad}
            mode="rating"
        />
    )}
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold">{isEditMode ? "경기 결과 수정" : "경기 결과 입력"}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
          </div>
          <div className="p-6 space-y-6 flex-grow overflow-y-auto">
            <div>
              <p className="text-lg font-bold text-center mb-2">{match.home_team} vs {match.away_team}</p>
              <div className="flex items-center justify-center gap-4">
                  <Input 
                      type="number" 
                      value={homeScore} 
                      onChange={e => setHomeScore(Number(e.target.value))} 
                      className="text-center text-2xl font-bold w-24" 
                      placeholder="홈" 
                      required 
                  />
                  <span className="text-2xl font-bold text-gray-300">:</span>
                  <Input 
                      type="number" 
                      value={awayScore} 
                      onChange={e => setAwayScore(Number(e.target.value))} 
                      className="text-center text-2xl font-bold w-24" 
                      placeholder="원정" 
                      required 
                  />
              </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">선수 명단</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsSquadModalOpen(true)} disabled={isEditMode}>
                      <UsersIcon className="w-4 h-4 mr-2" />
                      스쿼드에서 불러오기
                  </Button>
                </div>
                {isEditMode && <p className="text-xs text-center text-orange-600 bg-orange-100 p-2 rounded-md -mt-2">선수 평점이 생성된 이후에는 선수 명단을 수정할 수 없습니다.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PlayerList players={starters} title="선발 라인업" />
                    <PlayerList players={substitutes} title="교체 선수" />
                </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10 border-t">
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit">{isEditMode ? "결과 수정하기" : "결과 저장 및 평점 생성"}</Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default MatchResultModal;