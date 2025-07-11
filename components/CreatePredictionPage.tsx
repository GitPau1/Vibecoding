

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoteKind } from '../types';
import { VoteCreationData } from '../App';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface CreatePredictionPageProps {
  onCreateVote: (voteData: VoteCreationData) => void;
}

const CreatePredictionPage: React.FC<CreatePredictionPageProps> = ({ onCreateVote }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const { addToast } = useToast();

  const getMinDateTime = () => {
    const now = new Date();
    // Adjust for timezone offset to get local time in ISO format that datetime-local input understands
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
    return localISOTime;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (teamAName.trim() === '' || teamBName.trim() === '') {
        addToast('두 팀의 이름을 모두 입력해주세요.', 'error');
        return;
    }

    if (!endDate) {
        addToast('마감 시간을 설정해주세요.', 'error');
        return;
    }

    const voteOptions = [
        { label: teamAName.trim() },
        { label: teamBName.trim() },
    ];
    
    // Convert local datetime string to full ISO string
    const endDateTime = new Date(endDate).toISOString();
    
    onCreateVote({
        title: title.trim(),
        description: description.trim(),
        type: VoteKind.MATCH_PREDICTION,
        endDate: endDateTime,
        imageUrl,
        options: voteOptions,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">새로운 경기 스코어 예측 생성</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">예측 제목</label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 맨시티 vs 리버풀, 승자는?" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="teamA" className="block text-sm font-medium text-gray-700 mb-1">홈 팀</label>
                <Input id="teamA" value={teamAName} onChange={e => setTeamAName(e.target.value)} placeholder="홈 팀 이름" required />
            </div>
            <div>
                <label htmlFor="teamB" className="block text-sm font-medium text-gray-700 mb-1">어웨이 팀</label>
                <Input id="teamB" value={teamBName} onChange={e => setTeamBName(e.target.value)} placeholder="어웨이 팀 이름" required />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
            <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="예측에 대한 간단한 설명을 입력하세요." />
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
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">마감 시간</label>
            <Input 
              id="endDate" 
              type="datetime-local" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              required 
              min={getMinDateTime()}
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
            <Button type="submit">스코어 예측 생성하기</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePredictionPage;