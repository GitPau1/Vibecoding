import React, { useState, useMemo } from 'react';
import { SquadPlayer, PlayerPosition } from '../types';
import { SquadPlayerCreationData } from '../App';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { XIcon } from './icons/XIcon';
import { useToast } from '../contexts/ToastContext';

interface PlayerFormModalProps {
  playerToEdit: SquadPlayer | null;
  onClose: () => void;
  onSave: (playerData: SquadPlayerCreationData, id?: string) => void;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({ playerToEdit, onClose, onSave }) => {
  const [name, setName] = useState(playerToEdit?.name || '');
  const [number, setNumber] = useState(playerToEdit?.number || '');
  const [position, setPosition] = useState(playerToEdit?.position || PlayerPosition.MF);
  const [photoUrl, setPhotoUrl] = useState(playerToEdit?.photoUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      { name, number: Number(number), position, photoUrl },
      playerToEdit?.id
    );
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold">{playerToEdit ? '선수 정보 수정' : '새 선수 추가'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">등번호</label>
                <Input id="number" type="number" value={String(number)} onChange={e => setNumber(Number(e.target.value))} required />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">포지션</label>
                <Select id="position" value={position} onChange={e => setPosition(e.target.value as PlayerPosition)}>
                  {Object.values(PlayerPosition).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-1">사진 URL (선택)</label>
              <Input id="photoUrl" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
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


interface SquadPageProps {
  players: SquadPlayer[];
  onAddPlayer: (playerData: SquadPlayerCreationData) => void;
  onUpdatePlayer: (id: string, playerData: SquadPlayerCreationData) => void;
  onDeletePlayer: (id: string) => void;
}

const SquadPage: React.FC<SquadPageProps> = ({ players, onAddPlayer, onUpdatePlayer, onDeletePlayer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<SquadPlayer | null>(null);
  const { addToast } = useToast();

  const groupedPlayers = useMemo(() => {
    return players.reduce((acc, player) => {
      (acc[player.position] = acc[player.position] || []).push(player);
      return acc;
    }, {} as Record<PlayerPosition, SquadPlayer[]>);
  }, [players]);

  const handleSavePlayer = (playerData: SquadPlayerCreationData, id?: string) => {
    if (id) {
      onUpdatePlayer(id, playerData);
    } else {
      onAddPlayer(playerData);
    }
    setIsModalOpen(false);
    setPlayerToEdit(null);
  };

  const handleOpenModal = (player: SquadPlayer | null = null) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (player: SquadPlayer) => {
    if (window.confirm(`'${player.name}' 선수를 삭제하시겠습니까?`)) {
      onDeletePlayer(player.id);
      addToast('선수가 삭제되었습니다.', 'info');
    }
  };
  
  const positionOrder: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DF, PlayerPosition.MF, PlayerPosition.FW];

  return (
    <>
      {isModalOpen && <PlayerFormModal playerToEdit={playerToEdit} onClose={() => setIsModalOpen(false)} onSave={handleSavePlayer} />}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">스쿼드 관리</h2>
            <p className="text-gray-500 mt-2">팀의 선수들을 관리합니다. 여기서 추가된 선수는 평점/투표 생성 시 쉽게 불러올 수 있습니다.</p>
          </div>
          <Button onClick={() => handleOpenModal()} size="lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            선수 추가
          </Button>
        </div>

        {positionOrder.map(position => (
          (groupedPlayers[position] && groupedPlayers[position].length > 0) && (
            <section key={position} className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#6366f1]">{position}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 desktop:grid-cols-5 gap-6">
                {groupedPlayers[position].map(player => (
                  <Card key={player.id} className="p-0 text-center group relative overflow-hidden">
                    <ImageWithFallback src={player.photoUrl} alt={player.name} className="w-full h-48 object-cover object-top" />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white font-bold text-xl w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/50">
                      {player.number}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-lg text-gray-900 truncate">{player.name}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(player)}>수정</Button>
                      <Button variant="primary" size="sm" onClick={() => handleDeleteClick(player)}>삭제</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )
        ))}

        {players.length === 0 && (
          <div className="text-center py-20 px-6 bg-gray-100 rounded-2xl">
            <p className="text-xl text-gray-500">등록된 선수가 없습니다.</p>
            <p className="text-gray-400 mt-2">오른쪽 위의 '선수 추가' 버튼을 눌러 스쿼드를 구성해보세요.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SquadPage;
