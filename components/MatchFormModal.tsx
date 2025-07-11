


import React, { useState } from 'react';
import { Match } from '../types';
import { MatchCreationData } from '../App';
import { Button } from './ui/Button';
import { XIcon } from './icons/XIcon';
import { Input } from './ui/Input';

interface MatchFormModalProps {
  matchToEdit: Match | null;
  onClose: () => void;
  onSave: (matchData: MatchCreationData, id?: string) => void;
}

const MatchFormModal: React.FC<MatchFormModalProps> = ({ matchToEdit, onClose, onSave }) => {
  const [competition, setCompetition] = useState(matchToEdit?.competition || '');
  const [homeTeam, setHomeTeam] = useState(matchToEdit?.home_team || '');
  const [awayTeam, setAwayTeam] = useState(matchToEdit?.away_team || '');
  const [matchTime, setMatchTime] = useState(matchToEdit ? new Date(new Date(matchToEdit.match_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');


  const getMinDateTime = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
    return localISOTime;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchData: MatchCreationData = {
        competition: competition.trim(),
        home_team: homeTeam.trim(),
        away_team: awayTeam.trim(),
        match_time: new Date(matchTime).toISOString(),
    };
    onSave(matchData, matchToEdit?.id);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">{matchToEdit ? '경기 정보 수정' : '새 경기 생성'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-1">대회명</label>
              <Input id="competition" value={competition} onChange={e => setCompetition(e.target.value)} placeholder="예: 프리미어리그" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-700 mb-1">홈 팀</label>
                <Input id="homeTeam" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-700 mb-1">어웨이 팀</label>
                <Input id="awayTeam" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="match_time" className="block text-sm font-medium text-gray-700 mb-1">경기 시간</label>
              <Input id="match_time" type="datetime-local" value={matchTime} onChange={e => setMatchTime(e.target.value)} required min={getMinDateTime()} />
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit">저장하기</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchFormModal;