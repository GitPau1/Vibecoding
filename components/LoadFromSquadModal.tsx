import React, { useState, useMemo } from 'react';
import { SquadPlayer, PlayerPosition } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { XIcon } from './icons/XIcon';
import { Input } from './ui/Input';

type Selection = { [playerId: string]: { selected: boolean; isStarter?: boolean } };

interface LoadFromSquadModalProps {
  squadPlayers: SquadPlayer[];
  onClose: () => void;
  onConfirm: (result: any) => void;
  mode: 'vote' | 'rating';
}

const LoadFromSquadModal: React.FC<LoadFromSquadModalProps> = ({ squadPlayers, onClose, onConfirm, mode }) => {
  const [selection, setSelection] = useState<Selection>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectionChange = (playerId: string) => {
    setSelection(prev => {
      const current = prev[playerId];
      const isCurrentlySelected = !!current?.selected;

      if (isCurrentlySelected) {
        // Was selected, now unselect
        return { ...prev, [playerId]: { ...current, selected: false } };
      } else {
        // Was not selected, now select and default to starter for rating mode
        return { ...prev, [playerId]: { selected: true, isStarter: mode === 'rating' ? true : undefined } };
      }
    });
  };

  const handleStarterChange = (playerId: string) => {
    setSelection(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], isStarter: !prev[playerId]?.isStarter }
    }));
  };

  const handleConfirm = () => {
    const selectedPlayerIds = Object.keys(selection).filter(id => selection[id]?.selected);
    const resultPlayers = squadPlayers.filter(p => selectedPlayerIds.includes(p.id));

    if (mode === 'rating') {
      const result = resultPlayers.map(p => ({
        player: p,
        isStarter: !!selection[p.id]?.isStarter
      }));
      onConfirm(result);
    } else {
      onConfirm(resultPlayers);
    }
  };
  
  const filteredPlayers = useMemo(() => {
    return squadPlayers.filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [squadPlayers, searchTerm]);
  
  const groupedPlayers = useMemo(() => {
    return filteredPlayers.reduce((acc, player) => {
      (acc[player.position] = acc[player.position] || []).push(player);
      return acc;
    }, {} as Record<PlayerPosition, SquadPlayer[]>);
  }, [filteredPlayers]);
  
  const positionOrder: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DF, PlayerPosition.MF, PlayerPosition.FW];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <Card className="modal-content w-full max-w-2xl max-h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">스쿼드에서 불러오기</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-4">
            <Input 
                type="search"
                placeholder="선수 이름으로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="p-4 flex-grow overflow-y-auto space-y-6">
          {positionOrder.map(position => (
            (groupedPlayers[position] && groupedPlayers[position].length > 0) && (
              <div key={position}>
                <h4 className="font-bold text-gray-700 mb-2">{position}</h4>
                <div className="space-y-2">
                  {groupedPlayers[position].map(player => (
                    <label key={player.id} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${selection[player.id]?.selected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200'}`}>
                      <input 
                        type="checkbox"
                        checked={!!selection[player.id]?.selected}
                        onChange={() => handleSelectionChange(player.id)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <ImageWithFallback src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover mx-4" />
                      <div className="flex-grow">
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-sm text-gray-500">No. {player.number}</p>
                      </div>
                      {mode === 'rating' && selection[player.id]?.selected && (
                        <label className="flex items-center mr-4 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selection[player.id]?.isStarter}
                            onChange={() => handleStarterChange(player.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                          />
                          선발
                        </label>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )
          ))}
          {filteredPlayers.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 sticky bottom-0 z-10 border-t">
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="button" onClick={handleConfirm}>선택 완료</Button>
        </div>
      </Card>
    </div>
  );
};

export default LoadFromSquadModal;