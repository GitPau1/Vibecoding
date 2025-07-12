
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, SquadPlayer } from '../types';
import { PlayerRatingCreationData } from '../App';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { useToast } from '../contexts/ToastContext';
import { UsersIcon } from './icons/UsersIcon';
import LoadFromSquadModal from './LoadFromSquadModal';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface PlayerInputsProps {
    playerList: { name: string; team: string; photoUrl: string }[];
    listType: 'starters' | 'substitutes';
    onPlayerChange: (listType: 'starters' | 'substitutes', index: number, field: 'name' | 'team' | 'photoUrl', value: string) => void;
    onRemovePlayer: (listType: 'starters' | 'substitutes', index: number) => void;
    minPlayers: number;
    onDragStart: (e: React.DragEvent, index: number, listType: 'starters' | 'substitutes') => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, index: number, listType: 'starters' | 'substitutes') => void;
}

const PlayerInputs: React.FC<PlayerInputsProps> = React.memo(({ playerList, listType, onPlayerChange, onRemovePlayer, minPlayers, onDragStart, onDragEnd, onDrop }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLDivElement;
        target.classList.add('drag-over');
    };
    const handleDragLeave = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLDivElement;
        target.classList.remove('drag-over');
    };
    const handleDropInternal = (e: React.DragEvent, index: number) => {
        const target = e.currentTarget as HTMLDivElement;
        target.classList.remove('drag-over');
        onDrop(e, index, listType);
    };

    return (
        <>
            {playerList.map((player, index) => (
                <div
                    key={index}
                    draggable
                    onDragStart={(e) => onDragStart(e, index, listType)}
                    onDragEnd={onDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropInternal(e, index)}
                    className="p-4 border rounded-lg bg-gray-50/50 space-y-3 relative group cursor-grab active:cursor-grabbing"
                >
                    {playerList.length > minPlayers && (
                        <button type="button" onClick={() => onRemovePlayer(listType, index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold w-6 h-6 rounded-full flex items-center justify-center bg-white border border-transparent hover:border-red-300 transition-all opacity-0 group-hover:opacity-100">&times;</button>
                    )}
                    <Input placeholder="선수 이름" value={player.name} onChange={e => onPlayerChange(listType, index, 'name', e.target.value)} required />
                    <Input placeholder="소속 팀 (선택)" value={player.team} onChange={e => onPlayerChange(listType, index, 'team', e.target.value)} />
                    <Input placeholder="선수 사진 URL (선택)" value={player.photoUrl} onChange={e => onPlayerChange(listType, index, 'photoUrl', e.target.value)} />
                </div>
            ))}
        </>
    );
});

interface CreateRatingPageProps {
  onCreateRating: (ratingData: PlayerRatingCreationData) => void;
  squadPlayers: SquadPlayer[];
}

const CreateRatingPage: React.FC<CreateRatingPageProps> = ({ onCreateRating, squadPlayers }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState('');
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [starters, setStarters] = useState<{ name: string; team: string; photoUrl: string }[]>([
    ...Array(11).fill({ name: '', team: '', photoUrl: '' })
  ]);
  const [substitutes, setSubstitutes] = useState<{ name: string; team: string; photoUrl: string }[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ list: 'starters' | 'substitutes', index: number } | null>(null);

  const handlePlayerChange = useCallback((listType: 'starters' | 'substitutes', index: number, field: 'name' | 'team' | 'photoUrl', value: string) => {
    const setter = listType === 'starters' ? setStarters : setSubstitutes;
    setter(prevList => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  }, []);

  const addPlayer = useCallback((listType: 'starters' | 'substitutes') => {
      const setter = listType === 'starters' ? setStarters : setSubstitutes;
      setter(prev => [...prev, { name: '', team: '', photoUrl: '' }]);
  }, []);

  const removePlayer = useCallback((listType: 'starters' | 'substitutes', index: number) => {
    const setter = listType === 'starters' ? setStarters : setSubstitutes;
    const minLength = listType === 'starters' ? 1 : 0;
    setter(prevList => {
        if (prevList.length > minLength) {
            return prevList.filter((_, i) => i !== index);
        }
        return prevList;
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number, listType: 'starters' | 'substitutes') => {
    setDraggedItem({ list: listType, index });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.5'; }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, targetList: 'starters' | 'substitutes') => {
    e.preventDefault();
    if (!draggedItem || draggedItem.list !== targetList) {
        if (draggedItem && draggedItem.list !== targetList) {
            addToast('선수는 선발/교체 그룹 내에서만 순서를 변경할 수 있습니다.', 'info');
        }
        return;
    }
    
    const sourceIndex = draggedItem.index;
    if (sourceIndex === targetIndex) return;

    const listSetter = targetList === 'starters' ? setStarters : setSubstitutes;
    
    listSetter(prevList => {
        const list = [...prevList];
        const [removed] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, removed);
        return list;
    });
  };

  const handleLoadFromSquad = (loadedPlayers: {player: SquadPlayer, isStarter: boolean}[]) => {
    const newStarters = loadedPlayers.filter(p => p.isStarter).map(p => ({
        name: p.player.name,
        team: p.player.position,
        photoUrl: p.player.photoUrl || ''
    }));
    const newSubstitutes = loadedPlayers.filter(p => !p.isStarter).map(p => ({
        name: p.player.name,
        team: p.player.position,
        photoUrl: p.player.photoUrl || ''
    }));

    setStarters(newStarters);
    setSubstitutes(newSubstitutes);
    setIsModalOpen(false);
    addToast(`${loadedPlayers.length}명의 선수를 불러왔습니다.`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validStarters = starters.filter(p => p.name.trim() !== '');
    const validSubstitutes = substitutes.filter(p => p.name.trim() !== '');

    if (validStarters.length < 1) {
        addToast('최소 1명 이상의 선발 선수를 입력해야 합니다.', 'error');
        return;
    }
    
    const allPlayers = [
        ...validStarters.map(p => ({...p, isStarter: true})),
        ...validSubstitutes.map(p => ({...p, isStarter: false})),
    ];

    const ratingPlayers: Player[] = allPlayers.map((p, index) => ({
        id: index + 1,
        name: p.name.trim(),
        team: p.team.trim(),
        photoUrl: p.photoUrl.trim() || `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(p.name.trim())}`,
        isStarter: p.isStarter
    }));
    
    onCreateRating({ 
        title: title.trim(), 
        description: description.trim(), 
        endDate, 
        imageUrl,
        players: ratingPlayers,
    });
  };

  return (
    <>
      {isModalOpen && (
        <LoadFromSquadModal
          squadPlayers={squadPlayers}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleLoadFromSquad}
          mode="rating"
        />
      )}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-1">선수 평점 생성</h2>
          <p className="text-gray-500 mb-6">종료된 경기의 선수 평점을 생성하고 공유해보세요.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">평점 제목</label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 2026 월드컵 예선 중국전 선수 평점" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
              <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="평점에 대한 간단한 설명을 입력하세요." />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">대표 이미지 URL (선택)</label>
              <Input
                id="imageUrl"
                value={imageUrl || ''}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
              {imageUrl && (
                <div className="mt-4 text-center">
                  <ImageWithFallback src={imageUrl} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    이미지 링크 삭제
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">평점 마감 시간</label>
              <Input 
                  id="endDate" 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  required 
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500 mt-1">이 시간이 지나면 평점을 제출할 수 없습니다.</p>
            </div>
            
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">선수 명단 입력</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                      <UsersIcon className="w-4 h-4 mr-2" />
                      스쿼드에서 불러오기
                  </Button>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">선발 선수 (최소 1명)</h4>
                    <div className="space-y-3">
                        <PlayerInputs 
                            playerList={starters}
                            listType="starters"
                            onPlayerChange={handlePlayerChange}
                            onRemovePlayer={removePlayer}
                            minPlayers={1}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                        />
                        <Button type="button" variant="outline" onClick={() => addPlayer('starters')}>
                            <PlusIcon className="w-4 h-4 mr-2" /> 선발 선수 추가
                        </Button>
                    </div>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">교체 선수 (선택)</h4>
                    <div className="space-y-3">
                        <PlayerInputs 
                            playerList={substitutes}
                            listType="substitutes"
                            onPlayerChange={handlePlayerChange}
                            onRemovePlayer={removePlayer}
                            minPlayers={0}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                        />
                        <Button type="button" variant="outline" onClick={() => addPlayer('substitutes')}>
                            <PlusIcon className="w-4 h-4 mr-2" /> 교체 선수 추가
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
              <Button type="submit">평점 생성하기</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreateRatingPage;
