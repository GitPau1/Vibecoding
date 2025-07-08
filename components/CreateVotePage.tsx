

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, VoteKind, Player, SquadPlayer } from '../types';
import { VoteCreationData } from '../App';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { PlusIcon } from './icons/PlusIcon';
import { useToast } from '../contexts/ToastContext';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { UsersIcon } from './icons/UsersIcon';
import LoadFromSquadModal from './LoadFromSquadModal';

interface PlayerInputsProps {
    playerList: { name: string; team: string; photoUrl: string }[];
    onPlayerChange: (index: number, field: 'name' | 'team' | 'photoUrl', value: string) => void;
    onRemovePlayer: (index: number) => void;
}

const PlayerInputs: React.FC<PlayerInputsProps> = React.memo(({ playerList, onPlayerChange, onRemovePlayer }) => (
    <>
        {playerList.map((player, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50/50 space-y-3 relative group">
                {playerList.length > 2 && (
                    <button type="button" onClick={() => onRemovePlayer(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold w-6 h-6 rounded-full flex items-center justify-center bg-white border border-transparent hover:border-red-300 transition-all opacity-0 group-hover:opacity-100">&times;</button>
                )}
                <Input placeholder="선수 이름" value={player.name} onChange={e => onPlayerChange(index, 'name', e.target.value)} required />
                <Input placeholder="소속 팀 (선택)" value={player.team} onChange={e => onPlayerChange(index, 'team', e.target.value)} />
                <Input placeholder="선수 사진 URL (선택)" value={player.photoUrl} onChange={e => onPlayerChange(index, 'photoUrl', e.target.value)} />
            </div>
        ))}
    </>
));

interface CreateVotePageProps {
  onCreateVote: (voteData: VoteCreationData) => void;
  squadPlayers: SquadPlayer[];
}

const CreateVotePage: React.FC<CreateVotePageProps> = ({ onCreateVote, squadPlayers }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<VoteKind>(VoteKind.TOPIC);
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  
  // For Player type
  const [players, setPlayers] = useState<{ name: string; team: string; photoUrl: string }[]>([
    { name: '', team: '', photoUrl: '' }, { name: '', team: '', photoUrl: '' },
  ]);

  // For Match/Topic type
  const [options, setOptions] = useState<{label: string}[]>([{ label: '' }, { label: '' }]);

  useEffect(() => {
    // Reset options when type changes
    if (type === VoteKind.PLAYER) {
        setPlayers([{ name: '', team: '', photoUrl: '' }, { name: '', team: '', photoUrl: '' }]);
    } else {
        setOptions([{ label: '' }, { label: '' }]);
    }
  }, [type]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions(prevOptions => {
        const newOptions = [...prevOptions];
        newOptions[index] = { ...newOptions[index], label: value };
        return newOptions;
    });
  }, []);

  const addOption = useCallback(() => {
      if(options.length < 10) {
        setOptions(prev => [...prev, { label: '' }]);
      }
  }, [options.length]);

  const removeOption = useCallback((index: number) => {
      if(options.length > 2) {
        setOptions(prev => prev.filter((_, i) => i !== index));
      }
  }, [options.length]);

  const handlePlayerListChange = useCallback((
    index: number, field: 'name' | 'team' | 'photoUrl', value: string
  ) => {
    setPlayers(prevPlayers => {
        const newList = [...prevPlayers];
        newList[index] = { ...newList[index], [field]: value };
        return newList;
    });
  }, []);

  const addPlayerToList = useCallback(() => {
    if (players.length < 25) {
      setPlayers(prev => [...prev, { name: '', team: '', photoUrl: '' }]);
    }
  }, [players.length]);

  const removePlayerFromList = useCallback((index: number) => {
    if (players.length > 2) {
      setPlayers(prev => prev.filter((_, i) => i !== index));
    }
  }, [players.length]);
  
  const handleLoadFromSquad = (selectedPlayers: SquadPlayer[]) => {
    const newPlayers = selectedPlayers.map(p => ({
      name: p.name,
      team: p.position,
      photoUrl: p.photoUrl || '',
    }));
    setPlayers(newPlayers);
    setIsModalOpen(false);
    addToast(`${selectedPlayers.length}명의 선수를 불러왔습니다.`, 'success');
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let voteOptions: { label: string }[] = [];
    let votePlayers: Player[] | undefined = undefined;

    if (type === VoteKind.PLAYER) {
        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length < 2) {
            addToast('최소 2명 이상의 선수 정보를 입력해야 합니다.', 'error');
            return;
        }
        voteOptions = validPlayers.map(p => ({ label: p.name.trim() }));
        votePlayers = validPlayers.map((p, index) => ({
            id: index + 1,
            name: p.name.trim(),
            team: p.team.trim(),
            photoUrl: p.photoUrl.trim() || `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(p.name.trim())}`,
        }));
    } else if (type === VoteKind.MATCH) {
        const teamA = options[0]?.label.trim();
        const teamB = options[1]?.label.trim();
        if (!teamA || !teamB) {
            addToast("경기할 두 팀의 이름을 모두 입력해주세요.", 'error');
            return;
        }
        voteOptions = [ {label: `${teamA} 승`}, {label: '무승부'}, {label: `${teamB} 승`} ];
    } else { // TOPIC
        const validOptions = options.filter(opt => opt.label.trim() !== '');
        if (validOptions.length < 2) {
            addToast('최소 2개 이상의 선택지를 입력해야 합니다.', 'error');
            return;
        }
        voteOptions = validOptions.map(opt => ({label: opt.label.trim()}));
    }
    
    onCreateVote({ title: title.trim(), description: description.trim(), type, endDate, imageUrl, options: voteOptions, players: votePlayers });
  };

  const renderOptionFields = () => {
    switch(type) {
      case VoteKind.PLAYER:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">투표할 선수 정보를 입력하세요. (최소 2명)</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    스쿼드에서 불러오기
                </Button>
            </div>
            <PlayerInputs 
                playerList={players}
                onPlayerChange={handlePlayerListChange}
                onRemovePlayer={removePlayerFromList}
            />
            <Button type="button" variant="outline" onClick={addPlayerToList} className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" />
                선수 추가
            </Button>
          </div>
        )
      case VoteKind.MATCH:
        return (
             <div className="space-y-4">
                 <p className="text-sm text-gray-600">경기할 두 팀의 이름을 입력하세요.</p>
                 <Input placeholder="팀 A 이름" value={options[0]?.label || ''} onChange={e => handleOptionChange(0, e.target.value)} required />
                 <Input placeholder="팀 B 이름" value={options[1]?.label || ''} onChange={e => handleOptionChange(1, e.target.value)} required />
                 <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-md">'{options[0]?.label.trim() || '팀 A'} 승', '무승부', '{options[1]?.label.trim() || '팀 B'} 승' 3개의 옵션으로 투표가 생성됩니다.</p>
             </div>
        )
      case VoteKind.TOPIC:
        return (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">투표 선택지를 입력하세요. (최소 2개)</p>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input placeholder={`선택지 ${index + 1}`} value={option.label} onChange={e => handleOptionChange(index, e.target.value)} required />
                    {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(index)} className="text-gray-400 hover:text-red-500 font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">&times;</button>
                    )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption} className="w-full">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  선택지 추가
              </Button>
            </div>
        )
    }
  }

  return (
    <>
      {isModalOpen && (
        <LoadFromSquadModal
          squadPlayers={squadPlayers}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleLoadFromSquad}
          mode="vote"
        />
      )}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">새로운 투표 생성</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">투표 제목</label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 다음 경기 승리팀은?" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
              <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="투표에 대한 간단한 설명을 입력하세요." />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">투표 종류</label>
                  <Select id="type" value={type} onChange={e => setType(e.target.value as VoteKind)}>
                    {Object.values(VoteKind).filter(k => k !== VoteKind.RATING).map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required 
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">옵션 설정</h3>
                {renderOptionFields()}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
              <Button type="submit">투표 생성하기</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreateVotePage;