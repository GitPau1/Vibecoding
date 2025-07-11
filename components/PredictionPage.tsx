

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, VoteKind, UserScorePrediction } from '../types';
import { Card } from './ui/Card';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

interface PredictionInputProps {
  vote: Vote;
  onPredict: (voteId: string, scoreA: number, scoreB: number) => void;
}

const ScoreStepper: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => {
  const handleDecrement = () => onChange(Math.max(0, value - 1));
  const handleIncrement = () => onChange(Math.min(99, value + 1));

  return (
    <div className="flex-1 text-center">
      <p className="block font-bold text-xl mb-2 truncate">{label}</p>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <Button type="button" onClick={handleDecrement} disabled={value <= 0} variant="outline" className="w-12 h-12 !rounded-full !p-0 text-3xl font-light select-none">-</Button>
        <span className="text-5xl sm:text-6xl font-bold text-gray-800 w-20 text-center tabular-nums">{value}</span>
        <Button type="button" onClick={handleIncrement} disabled={value >= 99} variant="outline" className="w-12 h-12 !rounded-full !p-0 text-3xl font-light select-none">+</Button>
      </div>
    </div>
  );
};


const PredictionInput: React.FC<PredictionInputProps> = ({ vote, onPredict }) => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const teamAName = vote.options[0]?.label || 'Team A';
  const teamBName = vote.options[1]?.label || 'Team B';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict(vote.id, scoreA, scoreB);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-semibold text-lg text-center text-gray-800">스코어를 예측해주세요</h3>
      <div className="flex items-start justify-center gap-2 sm:gap-4">
        <ScoreStepper label={teamAName} value={scoreA} onChange={setScoreA} />
        <div className="text-5xl sm:text-6xl font-bold text-gray-300 pt-10">:</div>
        <ScoreStepper label={teamBName} value={scoreB} onChange={setScoreB} />
      </div>
      <div className="text-center pt-4">
        <Button type="submit" size="lg">예측 제출하기</Button>
      </div>
    </form>
  );
};

interface PredictionResultsProps {
  vote: Vote;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ vote }) => {
    const { profile } = useAuth();
    const teamAName = vote.options[0]?.label || 'Team A';
    const teamBName = vote.options[1]?.label || 'Team B';
    const myPrediction = vote.userScorePrediction;

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-lg text-gray-800">예측 현황</h3>
            {myPrediction && (
                 <Card className="bg-indigo-50 border-indigo-200 p-4">
                    <p className="text-center font-semibold text-indigo-800 mb-2">나의 예측</p>
                    <div className="flex items-center justify-between gap-4">
                        <span className="flex-1 font-bold text-xl text-right truncate">{teamAName}</span>
                        <span className="flex-none text-3xl font-bold text-indigo-700 tabular-nums">{myPrediction.scoreA} : {myPrediction.scoreB}</span>
                        <span className="flex-1 font-bold text-xl text-left truncate">{teamBName}</span>
                    </div>
                </Card>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {vote.scorePredictions && vote.scorePredictions.length > 0 ? (
                    vote.scorePredictions.map((p, index) => (
                        <Card key={p.id || index} className={`p-3 flex justify-between items-center ${p.user_id === profile?.id ? 'bg-gray-100' : ''}`}>
                            <span className="text-sm font-medium text-gray-600">익명의 사용자 {index + 1}</span>
                            <span className="font-bold text-lg text-gray-800">{p.score_a} : {p.score_b}</span>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">아직 제출된 예측이 없습니다.</p>
                )}
            </div>
            <p className="text-center text-sm text-gray-500 pt-2">총 {vote.scorePredictions?.length || 0}명이 참여했습니다.</p>
        </div>
    );
}


interface PredictionPageProps {
  votes: Vote[];
  onPredictScore: (voteId: string, scoreA: number, scoreB: number) => void;
}

const PredictionPage: React.FC<PredictionPageProps> = ({ votes, onPredictScore }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const vote = votes.find(v => v.id === id);

  useEffect(() => {
    if (!vote && votes.length > 0) {
      navigate('/', { replace: true });
    }
  }, [vote, votes, navigate]);

  if (!vote || vote.type !== VoteKind.MATCH_PREDICTION) {
    return null;
  }

  const hasPredicted = !!vote.userScorePrediction;
  const isExpired = new Date(vote.endDate) < new Date();
  const showResults = hasPredicted || isExpired;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <ImageWithFallback src={vote.imageUrl} alt={vote.title} className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-t-2xl" />
        <div className="p-6 md:p-8 text-left">
          <span className="text-sm font-semibold text-[#6366f1]">{vote.type}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{vote.title}</h2>
          {vote.description && <p className="mt-4 text-gray-600">{vote.description}</p>}
          <div className="mt-4 text-sm text-gray-500">
            {isExpired ? `예측이 ${new Date(vote.endDate).toLocaleString()}에 종료되었습니다.` : `마감: ${new Date(vote.endDate).toLocaleString()}`}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-8 md:px-8 border-t border-gray-100">
          {showResults ? <PredictionResults vote={vote} /> : <PredictionInput vote={vote} onPredict={onPredictScore} />}
        </div>
      </Card>
    </div>
  );
};

export default PredictionPage;